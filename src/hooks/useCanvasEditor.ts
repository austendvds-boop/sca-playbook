"use client";

import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { elementsAtom, redoStackAtom, selectedIdsAtom, undoStackAtom } from '@/atoms/canvas';
import { defensePresets, offensePresets } from '@/lib/presets';
import { CanvasElement } from '@/lib/store';

const FIELD_CENTER = { x: 500, y: 320 };
const MAX_HISTORY = 50;
const AUTOSAVE_DEBOUNCE_MS = 3000;
const SAVED_BADGE_MS = 2000;

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type SavePayload = {
  playId?: string;
  canvasData: CanvasElement[];
  thumbnailSvg: string;
};

type UseCanvasEditorConfig = {
  playId?: string;
  initialCanvasData?: CanvasElement[];
  onSave: (data: SavePayload) => Promise<void>;
};

const cloneElement = (el: CanvasElement): CanvasElement => {
  if (el.type === 'player') return { ...el };
  if (el.type === 'text') return { ...el };
  if (el.type === 'zone') return { ...el };
  return { ...el, points: el.points.map((p) => ({ ...p })) };
};

const snapshotFromMap = (map: Map<string, CanvasElement>) => [...map.values()].map(cloneElement);

function serializeCanvasSvg(): string {
  if (typeof document === 'undefined') return '';
  const svg = document.querySelector('svg');
  return svg ? new XMLSerializer().serializeToString(svg) : '';
}

export function useCanvasEditor({ playId, initialCanvasData, onSave }: UseCanvasEditorConfig) {
  const [elements, setElements] = useAtom(elementsAtom);
  const [selected, setSelected] = useAtom(selectedIdsAtom);
  const [undoStack, setUndo] = useAtom(undoStackAtom);
  const [redoStack, setRedo] = useAtom(redoStackAtom);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipAutosaveRef = useRef(true);
  const loadedSignatureRef = useRef<string | null>(null);
  const saveTokenRef = useRef(0);
  const elementsRef = useRef(elements);

  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const clearAutosaveTimer = useCallback(() => {
    if (!autosaveTimerRef.current) return;
    clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = null;
  }, []);

  const clearSavedTimer = useCallback(() => {
    if (!savedTimerRef.current) return;
    clearTimeout(savedTimerRef.current);
    savedTimerRef.current = null;
  }, []);

  const runSave = useCallback(
    async (canvasDataOverride?: CanvasElement[]) => {
      const canvasData = canvasDataOverride ?? [...elementsRef.current.values()];
      const token = ++saveTokenRef.current;
      clearSavedTimer();
      setSaveStatus('saving');

      try {
        await onSave({ playId, canvasData, thumbnailSvg: serializeCanvasSvg() });
        setSaveStatus('saved');

        savedTimerRef.current = setTimeout(() => {
          if (saveTokenRef.current === token) setSaveStatus('idle');
        }, SAVED_BADGE_MS);
      } catch (error) {
        console.error('Canvas save failed', error);
        setSaveStatus('error');
        throw error;
      }
    },
    [clearSavedTimer, onSave, playId]
  );

  const requestSaveNow = useCallback(
    async (canvasDataOverride?: CanvasElement[]) => {
      clearAutosaveTimer();
      await runSave(canvasDataOverride);
    },
    [clearAutosaveTimer, runSave]
  );

  const applyCanvasChange = useCallback(
    (updater: (prev: Map<string, CanvasElement>) => Map<string, CanvasElement>) => {
      setUndo((prev) => [...prev, snapshotFromMap(elementsRef.current)].slice(-MAX_HISTORY));
      setRedo([]);
      setElements((prev) => updater(prev));
    },
    [setElements, setRedo, setUndo]
  );

  const replaceCanvas = useCallback(
    (nextData: CanvasElement[]) => {
      const next = new Map<string, CanvasElement>();
      nextData.forEach((el) => next.set(el.id, cloneElement(el)));
      setElements(next);
      setSelected(new Set());
      setUndo([]);
      setRedo([]);
      skipAutosaveRef.current = true;
    },
    [setElements, setRedo, setSelected, setUndo]
  );

  useEffect(() => {
    const normalized = Array.isArray(initialCanvasData) ? initialCanvasData : [];
    const signature = JSON.stringify(normalized);
    if (loadedSignatureRef.current === signature) return;
    loadedSignatureRef.current = signature;
    replaceCanvas(normalized);
    setSaveStatus('idle');
  }, [initialCanvasData, replaceCanvas]);

  useEffect(
    () => () => {
      clearAutosaveTimer();
      clearSavedTimer();
    },
    [clearAutosaveTimer, clearSavedTimer]
  );

  useEffect(() => {
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false;
      return;
    }

    clearAutosaveTimer();
    autosaveTimerRef.current = setTimeout(() => {
      void runSave();
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [elements, clearAutosaveTimer, runSave]);

  const insertPlayer = useCallback(
    ({ label, side }: { label: string; side: 'offense' | 'defense' }) => {
      const player: CanvasElement = { id: uuid(), type: 'player', x: FIELD_CENTER.x, y: FIELD_CENTER.y, position: label, side };
      applyCanvasChange((prev) => new Map(prev).set(player.id, player));
      setSelected(new Set([player.id]));
    },
    [applyCanvasChange, setSelected]
  );

  const insertOLGroup = useCallback(() => {
    const group: CanvasElement[] = [
      { id: uuid(), type: 'player', x: 420, y: 320, position: 'LT', side: 'offense' },
      { id: uuid(), type: 'player', x: 460, y: 320, position: 'LG', side: 'offense' },
      { id: uuid(), type: 'player', x: 500, y: 320, position: 'C', side: 'offense' },
      { id: uuid(), type: 'player', x: 540, y: 320, position: 'RG', side: 'offense' },
      { id: uuid(), type: 'player', x: 580, y: 320, position: 'RT', side: 'offense' }
    ];

    applyCanvasChange((prev) => {
      const next = new Map(prev);
      group.forEach((el) => next.set(el.id, el));
      return next;
    });

    setSelected(new Set(group.map((el) => el.id)));
  }, [applyCanvasChange, setSelected]);

  const applyPreset = useCallback(
    (presetName: string, side: 'offense' | 'defense') => {
      const source = side === 'offense' ? offensePresets : defensePresets;
      const preset = source.find((p) => p.name === presetName);
      if (!preset) return;

      if (elementsRef.current.size > 0) {
        const prompt = side === 'defense' ? `Start a new play with ${preset.name} defense?` : `Replace current play with ${presetName}?`;
        const confirmed = window.confirm(prompt);
        if (!confirmed) return;
      }

      const next = new Map<string, CanvasElement>();
      preset.elements.forEach((el) => {
        const elId = uuid();
        next.set(elId, el.type === 'player' && side === 'defense' ? { ...el, id: elId, side: 'defense' } : { ...el, id: elId });
      });

      applyCanvasChange(() => next);
      setSelected(new Set());
    },
    [applyCanvasChange, setSelected]
  );

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1].map(cloneElement);
    setUndo((stack) => stack.slice(0, -1));
    setRedo((stack) => [...stack, snapshotFromMap(elementsRef.current)].slice(-MAX_HISTORY));
    setElements(new Map(prev.map((el) => [el.id, el])));
    setSelected(new Set());
  }, [undoStack, setUndo, setRedo, setElements, setSelected]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1].map(cloneElement);
    setRedo((stack) => stack.slice(0, -1));
    setUndo((stack) => [...stack, snapshotFromMap(elementsRef.current)].slice(-MAX_HISTORY));
    setElements(new Map(next.map((el) => [el.id, el])));
    setSelected(new Set());
  }, [redoStack, setRedo, setUndo, setElements, setSelected]);

  useEffect(() => {
    const onUndoEvent = () => handleUndo();
    const onRedoEvent = () => handleRedo();
    window.addEventListener('canvas-undo', onUndoEvent);
    window.addEventListener('canvas-redo', onRedoEvent);
    return () => {
      window.removeEventListener('canvas-undo', onUndoEvent);
      window.removeEventListener('canvas-redo', onRedoEvent);
    };
  }, [handleRedo, handleUndo]);

  const deleteSelected = useCallback(() => {
    if (selected.size === 0) return;

    applyCanvasChange((prev) => {
      const next = new Map(prev);
      selected.forEach((id) => next.delete(id));
      return next;
    });

    setSelected(new Set());
  }, [applyCanvasChange, selected, setSelected]);

  const offensePresetNames = useMemo(() => offensePresets.map((p) => p.name), []);
  const defensePresetNames = useMemo(() => defensePresets.map((p) => p.name), []);

  return {
    elements,
    selected,
    undoStack,
    redoStack,
    saveStatus,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    offensePresetNames,
    defensePresetNames,
    setSelected,
    applyCanvasChange,
    replaceCanvas,
    requestSaveNow,
    insertPlayer,
    insertOLGroup,
    applyPreset,
    handleUndo,
    handleRedo,
    deleteSelected
  };
}
