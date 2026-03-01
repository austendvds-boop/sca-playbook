"use client";
import { useEffect, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { FieldSVG } from '@/components/canvas/FieldSVG';
import { elementsAtom, selectedIdsAtom, undoStackAtom, redoStackAtom } from '@/atoms/canvas';
import { offensePresets, defensePresets } from '@/lib/presets';
import { CanvasElement } from '@/lib/store';

const FIELD_CENTER = { x: 500, y: 280 };

export default function NewPlay() {
  const [name, setName] = useState('New Play');
  const [elements, setElements] = useAtom(elementsAtom);
  const [selected, setSelected] = useAtom(selectedIdsAtom);
  const [undoStack, setUndo] = useAtom(undoStackAtom);
  const [redoStack, setRedo] = useAtom(redoStackAtom);
  const router = useRouter();

  useEffect(() => {
    setElements(new Map());
    setSelected(new Set());
    setUndo([]);
    setRedo([]);
  }, [setElements, setSelected, setUndo, setRedo]);

  const offensePresetNames = useMemo(() => offensePresets.map((p) => p.name), []);
  const defensePresetNames = useMemo(() => defensePresets.map((p) => p.name), []);

  const save = async () => {
    const res = await fetch('/api/plays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, canvasData: [...elements.values()], tags: ['general'] })
    });
    const d = await res.json();
    router.push(`/plays/${d.data.id}`);
  };

  const insertPlayer = ({ label, side }: { label: string; side: 'offense' | 'defense' }) => {
    const player: CanvasElement = { id: uuid(), type: 'player', x: FIELD_CENTER.x, y: FIELD_CENTER.y, position: label, side };
    setElements((prev) => new Map(prev).set(player.id, player));
    setSelected(new Set([player.id]));
  };

  const insertOLGroup = () => {
    const group: CanvasElement[] = [
      { id: uuid(), type: 'player', x: 380, y: 280, position: 'LT', side: 'offense' },
      { id: uuid(), type: 'player', x: 440, y: 280, position: 'LG', side: 'offense' },
      { id: uuid(), type: 'player', x: 500, y: 280, position: 'C', side: 'offense' },
      { id: uuid(), type: 'player', x: 560, y: 280, position: 'RG', side: 'offense' },
      { id: uuid(), type: 'player', x: 620, y: 280, position: 'RT', side: 'offense' }
    ];
    setElements((prev) => {
      const next = new Map(prev);
      group.forEach((el) => next.set(el.id, el));
      return next;
    });
    setSelected(new Set(group.map((el) => el.id)));
  };

  const applyPreset = (presetName: string, side: 'offense' | 'defense') => {
    const source = side === 'offense' ? offensePresets : defensePresets;
    const preset = source.find((p) => p.name === presetName);
    if (!preset) return;

    if (side === 'defense') {
      const confirmed = window.confirm(`Start a new play with ${preset.name} defense?`);
      if (!confirmed) return;
      setElements(new Map());
      setSelected(new Set());
      setUndo([]);
      setRedo([]);
      const next = new Map<string, CanvasElement>();
      preset.elements.forEach((el) => {
        const id = uuid();
        next.set(id, el.type === 'player' ? { ...el, id, side: 'defense' } : { ...el, id });
      });
      setElements(next);
      return;
    }

    if (elements.size > 0) {
      const confirmed = window.confirm(`Replace current play with ${presetName}?`);
      if (!confirmed) return;
    }
    const next = new Map<string, CanvasElement>();
    preset.elements.forEach((el) => {
      const id = uuid();
      next.set(id, { ...el, id });
    });
    setElements(next);
    setSelected(new Set());
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndo(undoStack.slice(0, -1));
    setRedo([...redoStack, [...elements.values()]]);
    setElements(new Map(prev.map((el) => [el.id, el])));
    setSelected(new Set());
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedo(redoStack.slice(0, -1));
    setUndo([...undoStack, [...elements.values()]]);
    setElements(new Map(next.map((el) => [el.id, el])));
    setSelected(new Set());
  };

  const deleteSelected = () => {
    if (selected.size === 0) return;
    setElements((prev) => {
      const next = new Map(prev);
      selected.forEach((id) => next.delete(id));
      return next;
    });
    setSelected(new Set());
  };

  return (
    <main className="w-screen overflow-hidden bg-[#111124] text-white" style={{ height: '100dvh' }}>
      <div className="flex w-screen flex-col overflow-hidden h-dvh">
        <CanvasToolbar
          name={name}
          onNameChange={setName}
          onBack={() => router.push('/plays')}
          onSave={save}
          onInsertPlayer={insertPlayer}
          onInsertOLGroup={insertOLGroup}
          onApplyPreset={applyPreset}
          offensePresetNames={offensePresetNames}
          defensePresetNames={defensePresetNames}
          onDeleteSelected={deleteSelected}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
        />
        <div className="flex-1 w-full min-h-0">
          <FieldSVG />
        </div>
      </div>
    </main>
  );
}