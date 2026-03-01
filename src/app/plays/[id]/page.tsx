"use client";
import { useEffect, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { FieldSVG } from '@/components/canvas/FieldSVG';
import { elementsAtom, selectedIdsAtom } from '@/atoms/canvas';
import { offensePresets, defensePresets } from '@/lib/presets';
import { CanvasElement } from '@/lib/store';

const FIELD_CENTER = { x: 500, y: 280 };

export default function PlayEdit({ params }: { params: { id: string } }) {
  const [elements, setElements] = useAtom(elementsAtom);
  const [selected, setSelected] = useAtom(selectedIdsAtom);
  const [name, setName] = useState('Play');
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/plays/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        const map = new Map<string, CanvasElement>();
        (d.data?.canvasData ?? []).forEach((e: CanvasElement) => map.set(e.id, e));
        setElements(map);
        setName(d.data?.name ?? 'Play');
      });
  }, [params.id, setElements]);

  const offensePresetNames = useMemo(() => offensePresets.map((p) => p.name), []);
  const defensePresetNames = useMemo(() => defensePresets.map((p) => p.name), []);

  const save = async () => {
    const svg = document.querySelector('svg');
    const thumbnailSvg = svg ? new XMLSerializer().serializeToString(svg) : '';
    await fetch(`/api/plays/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, canvasData: [...elements.values()], thumbnailSvg })
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
    await fetch(`/api/plays/${params.id}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mirror: true })
    });
  };

  const removePlay = async () => {
    await fetch(`/api/plays/${params.id}`, { method: 'DELETE' });
    router.push('/plays');
  };

  const insertPlayer = ({ label, side }: { label: string; side: 'offense' | 'defense' }) => {
    const player: CanvasElement = { id: uuid(), type: 'player', x: FIELD_CENTER.x, y: FIELD_CENTER.y, position: label, side };
    setElements((prev) => new Map(prev).set(player.id, player));
    setSelected(new Set([player.id]));
  };

  const applyPreset = (presetName: string, side: 'offense' | 'defense') => {
    const source = side === 'offense' ? offensePresets : defensePresets;
    const preset = source.find((p) => p.name === presetName);
    if (!preset) return;
    const next = new Map<string, CanvasElement>();
    preset.elements.forEach((el) => {
      const id = uuid();
      next.set(id, { ...el, id });
    });
    setElements(next);
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
    <main className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-[#111124] text-white">
      <CanvasToolbar
        name={name}
        onNameChange={setName}
        onBack={() => router.push('/plays')}
        onSave={save}
        onDelete={removePlay}
        onExportPng={exportPng}
        onMirror={mirror}
        onInsertPlayer={insertPlayer}
        onApplyPreset={applyPreset}
        offensePresetNames={offensePresetNames}
        defensePresetNames={defensePresetNames}
        onDeleteSelected={deleteSelected}
      />
      <div className="h-full w-full pb-14 pt-11">
        <FieldSVG />
      </div>
    </main>
  );
}
