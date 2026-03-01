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
const TAG_OPTIONS = ['red_zone', 'goal_line', '3rd_down', '2_minute', 'general'];
const MAX_HISTORY = 50;

const cloneElement = (el: CanvasElement): CanvasElement => {
  if (el.type === 'player') return { ...el };
  if (el.type === 'text') return { ...el };
  if (el.type === 'zone') return { ...el };
  return { ...el, points: el.points.map((p) => ({ ...p })) };
};

const snapshotFromMap = (map: Map<string, CanvasElement>) => [...map.values()].map(cloneElement);

export default function PlayEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [elements, setElements] = useAtom(elementsAtom);
  const [selected, setSelected] = useAtom(selectedIdsAtom);
  const [undoStack, setUndo] = useAtom(undoStackAtom);
  const [redoStack, setRedo] = useAtom(redoStackAtom);
  const [name, setName] = useState('Play');
  const [tags, setTags] = useState<string[]>(['general']);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const router = useRouter();

  const applyCanvasChange = (updater: (prev: Map<string, CanvasElement>) => Map<string, CanvasElement>) => {
    setUndo((prev) => [...prev, snapshotFromMap(elements)].slice(-MAX_HISTORY));
    setRedo([]);
    setElements((prev) => updater(prev));
  };

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
        setTags(Array.isArray(d.data?.tags) && d.data.tags.length ? d.data.tags : ['general']);
      });
  }, [id, setElements, setSelected, setUndo, setRedo]);

  useEffect(() => {
    const onUndoEvent = () => handleUndo();
    const onRedoEvent = () => handleRedo();
    window.addEventListener('canvas-undo', onUndoEvent);
    window.addEventListener('canvas-redo', onRedoEvent);
    return () => {
      window.removeEventListener('canvas-undo', onUndoEvent);
      window.removeEventListener('canvas-redo', onRedoEvent);
    };
  });

  const offensePresetNames = useMemo(() => offensePresets.map((p) => p.name), []);
  const defensePresetNames = useMemo(() => defensePresets.map((p) => p.name), []);

  const save = async () => {
    const svg = document.querySelector('svg');
    const thumbnailSvg = svg ? new XMLSerializer().serializeToString(svg) : '';
    await fetch(`/api/plays/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, tags, canvasData: [...elements.values()], thumbnailSvg })
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

  const toggleTag = async (tag: string) => {
    const next = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
    const normalized = next.length ? next : ['general'];
    setTags(normalized);
    await fetch(`/api/plays/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: normalized })
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

  const mirror = () => {
    applyCanvasChange((prev) => {
      const next = new Map<string, CanvasElement>();
      prev.forEach((e) => {
        if (e.type === 'player') next.set(e.id, { ...e, x: 1000 - e.x });
        else if (e.type === 'text') next.set(e.id, { ...e, x: 1000 - e.x });
        else if (e.type === 'zone') next.set(e.id, { ...e, cx: 1000 - e.cx });
        else next.set(e.id, { ...e, points: e.points.map((p) => ({ x: 1000 - p.x, y: p.y })) });
      });
      return next;
    });
  };

  const clearCanvas = () => {
    if (!window.confirm('Clear all players and routes?')) return;
    applyCanvasChange(() => new Map());
    setSelected(new Set());
  };

  const removePlay = async () => {
    await fetch(`/api/plays/${id}`, { method: 'DELETE' });
    router.push('/plays');
  };

  const insertPlayer = ({ label, side }: { label: string; side: 'offense' | 'defense' }) => {
    const player: CanvasElement = { id: uuid(), type: 'player', x: FIELD_CENTER.x, y: FIELD_CENTER.y, position: label, side };
    applyCanvasChange((prev) => new Map(prev).set(player.id, player));
    setSelected(new Set([player.id]));
  };

  const insertOLGroup = () => {
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
  };

  const applyPreset = (presetName: string, side: 'offense' | 'defense') => {
    const source = side === 'offense' ? offensePresets : defensePresets;
    const preset = source.find((p) => p.name === presetName);
    if (!preset) return;

    if (elements.size > 0) {
      const confirmed = window.confirm(side === 'defense' ? `Start a new play with ${preset.name} defense?` : `Replace current play with ${presetName}?`);
      if (!confirmed) return;
    }

    const next = new Map<string, CanvasElement>();
    preset.elements.forEach((el) => {
      const elId = uuid();
      next.set(elId, el.type === 'player' && side === 'defense' ? { ...el, id: elId, side: 'defense' } : { ...el, id: elId });
    });
    applyCanvasChange(() => next);
    setSelected(new Set());
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1].map(cloneElement);
    setUndo((stack) => stack.slice(0, -1));
    setRedo((stack) => [...stack, snapshotFromMap(elements)].slice(-MAX_HISTORY));
    setElements(new Map(prev.map((el) => [el.id, el])));
    setSelected(new Set());
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1].map(cloneElement);
    setRedo((stack) => stack.slice(0, -1));
    setUndo((stack) => [...stack, snapshotFromMap(elements)].slice(-MAX_HISTORY));
    setElements(new Map(next.map((el) => [el.id, el])));
    setSelected(new Set());
  };

  const deleteSelected = () => {
    if (selected.size === 0) return;
    applyCanvasChange((prev) => {
      const next = new Map(prev);
      selected.forEach((selId) => next.delete(selId));
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
          onClearCanvas={clearCanvas}
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

        <div className="no-print flex items-center gap-2 border-t border-white/10 bg-[#0E1022] px-3 py-2">
          <span className="text-xs uppercase tracking-wide text-slate-300">Tags</span>
          {tags.map((tag) => (
            <button key={tag} onClick={() => void toggleTag(tag)} className="rounded bg-[#003087] px-2 py-1 text-xs text-white">
              {tag} ×
            </button>
          ))}
          <div className="relative">
            <button onClick={() => setTagPickerOpen((v) => !v)} className="rounded border border-white/30 px-2 py-1 text-xs">+
            </button>
            {tagPickerOpen ? (
              <div className="absolute left-0 top-8 z-40 w-40 rounded border border-white/10 bg-[#111125] p-1">
                {TAG_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => void toggleTag(option)}
                    className={`block w-full rounded px-2 py-1 text-left text-xs ${tags.includes(option) ? 'bg-[#003087] text-white' : 'text-slate-200 hover:bg-white/10'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="w-full min-h-0" style={{ height: 'calc(100vh - 148px)' }}>
          <FieldSVG />
        </div>
      </div>
    </main>
  );
}
