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

export default function NewPlay() {
  const [name, setName] = useState('New Play');
  const [elements, setElements] = useAtom(elementsAtom);
  const [selected, setSelected] = useAtom(selectedIdsAtom);
  const router = useRouter();

  useEffect(() => {
    setElements(new Map());
    setSelected(new Set());
  }, [setElements, setSelected]);

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
