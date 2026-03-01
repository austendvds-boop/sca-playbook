"use client";
import { use, useEffect, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { FieldSVG } from '@/components/canvas/FieldSVG';
import { elementsAtom, selectedIdsAtom, undoStackAtom, redoStackAtom } from '@/atoms/canvas';
import { offensePresets, defensePresets } from '@/lib/presets';
import { CanvasElement } from '@/lib/store';

const FIELD_CENTER = { x: 500, y: 320 };

export default function PlayEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [elements, setElements] = useAtom(elementsAtom);
  const [selected, setSelected] = useAtom(selectedIdsAtom);
  const [undoStack, setUndo] = useAtom(undoStackAtom);
  const [redoStack, setRedo] = useAtom(redoStackAtom);
  const [name, setName] = useState('Play');
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/plays/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const map = new Map<string, CanvasElement>();
        (d.data?.canvasData ?? []).forEach((e: CanvasElement) => map.set(e.id, e));
        setElements(map);
        setSelected(new Set());
        setUndo([]);
        setRedo([]);
        setName(d.data?.name ?? 'Play');
      });
  }, [id, setElements, setSelected, setUndo, setRedo]);

  const offensePresetNames = useMemo(() => offensePresets.map((p) => p.name), []);
  const defensePresetNames = useMemo(() => defensePresets.map((p) => p.name), []);

  const save = async () => {
    const svg = document.querySelector('svg');
    const thumbnailSvg = svg ? new XMLSerializer().serializeToString(svg) : '';
    await fetch(`/api/plays/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, canvasData: [...elements.values()], thumbnailSvg })
    });
  };

  const renamePlay = async (nextName: string) => {
    setName(nextName);
    await fetch(`/api/plays/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nextName })
    });
  };

  const exportPng = async () => {
    const svg = document.querySelector('svg');
    if (!svg) return;
    const raw = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([raw], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 1600;
      c.height = 900;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#111124';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => {
        if (!b) return;
        const durl = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = durl;
        a.download = `${name.toLowerCase().replace(/\s+/g, '-') || 'play'}.png`;
        a.click();
        URL.revokeObjectURL(durl);
      }, 'image/png');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const mirror = async () => {
    await fetch(`/api/plays/${id}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mirror: true })
    });
  };

  const removePlay = async () => {
    await fetch(`/api/plays/${id}`, { method: 'DELETE' });
    router.push('/plays');
  };

  const insertPlayer = ({ label, side }: { label: string; side: 'offense' | 'defense' }) => {
    const player: CanvasElement = { id: uuid(), type: 'player', x: FIELD_CENTER.x, y: FIELD_CENTER.y, position: label, side };
    setElements((prev) => new Map(prev).set(player.id, player));
    setSelected(new Set([player.id]));
  };

  const insertOLGroup = () => {
    const group: CanvasElement[] = [
      { id: uuid(), type: 'player', x: 380, y: 320, position: 'LT', side: 'offense' },
      { id: uuid(), type: 'player', x: 440, y: 320, position: 'LG', side: 'offense' },
      { id: uuid(), type: 'player', x: 500, y: 320, position: 'C', side: 'offense' },
      { id: uuid(), type: 'player', x: 560, y: 320, position: 'RG', side: 'offense' },
      { id: uuid(), type: 'player', x: 620, y: 320, position: 'RT', side: 'offense' }
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
          onNameChange={(next) => void renamePlay(next)}
          onBack={() => router.push('/plays')}
          onSave={save}
          onDelete={removePlay}
          onExportPng={exportPng}
          onMirror={mirror}
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
