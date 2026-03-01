"use client";
import { useAtom } from 'jotai';
import { activeToolAtom, Tool } from '@/atoms/canvas';

const tools: { key: Tool; label: string; shortcut: string }[] = [
  { key: 'select', label: 'Select', shortcut: 'V' },
  { key: 'player', label: 'Player', shortcut: 'P' },
  { key: 'route', label: 'Route', shortcut: 'A' },
  { key: 'block', label: 'Block', shortcut: 'B' },
  { key: 'motion', label: 'Motion', shortcut: 'M' },
  { key: 'text', label: 'Text', shortcut: 'T' },
  { key: 'zone', label: 'Zone', shortcut: 'Z' }
];

export function CanvasToolbar({ onSave }: { onSave?: () => void }) {
  const [active, setActive] = useAtom(activeToolAtom);
  return (
    <div className="no-print flex flex-wrap gap-2 border-b bg-white p-2">
      {tools.map((t) => (
        <button key={t.key} onClick={() => setActive(t.key)} className={`rounded border px-3 py-1 text-sm ${active === t.key ? 'bg-[#CC0000] text-white border-[#CC0000]' : 'bg-slate-100'}`}>
          {t.label} <span className="opacity-75">({t.shortcut})</span>
        </button>
      ))}
      {onSave ? <button onClick={onSave} className="ml-auto rounded bg-[#003087] px-3 py-1 text-sm font-semibold text-white">Save (Ctrl+S)</button> : null}
    </div>
  );
}
