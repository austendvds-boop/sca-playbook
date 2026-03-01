"use client";

import { useAtom } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronsRight,
  Hexagon,
  MoreHorizontal,
  MoreVertical,
  MousePointer2,
  MoveRight,
  Save,
  Trash2,
  Type
} from 'lucide-react';
import { activeToolAtom, Tool } from '@/atoms/canvas';

type DrawerTab = 'offense' | 'defense' | 'presets' | null;

type PlayerToken = {
  label: string;
  side: 'offense' | 'defense';
};

type PresetButton = {
  name: string;
  side: 'offense' | 'defense';
};

const tools: { key: Tool; label: string; shortcut: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'select', label: 'Select', shortcut: 'V', icon: MousePointer2 },
  { key: 'route', label: 'Route', shortcut: 'A', icon: MoveRight },
  { key: 'block', label: 'Block', shortcut: 'B', icon: ChevronsRight },
  { key: 'motion', label: 'Motion', shortcut: 'M', icon: MoreHorizontal },
  { key: 'text', label: 'Text', shortcut: 'T', icon: Type },
  { key: 'zone', label: 'Zone', shortcut: 'Z', icon: Hexagon }
];

const offenseTokens: PlayerToken[] = [
  { label: 'T', side: 'offense' },
  { label: 'G', side: 'offense' },
  { label: 'C', side: 'offense' },
  { label: 'TE', side: 'offense' },
  { label: 'X', side: 'offense' },
  { label: 'Z', side: 'offense' },
  { label: 'H', side: 'offense' },
  { label: 'QB', side: 'offense' },
  { label: 'RB', side: 'offense' },
  { label: 'FB', side: 'offense' },
  { label: 'S', side: 'offense' }
];

const defenseTokens: PlayerToken[] = [
  { label: 'DE', side: 'defense' },
  { label: 'E', side: 'defense' },
  { label: 'DT', side: 'defense' },
  { label: 'N', side: 'defense' },
  { label: 'T', side: 'defense' },
  { label: 'B', side: 'defense' },
  { label: 'W', side: 'defense' },
  { label: 'M', side: 'defense' },
  { label: 'S', side: 'defense' },
  { label: 'CB', side: 'defense' },
  { label: 'C', side: 'defense' },
  { label: 'FS', side: 'defense' },
  { label: 'SS', side: 'defense' },
  { label: '$', side: 'defense' }
];

function tokenClasses(label: string, side: 'offense' | 'defense', picker = false) {
  const isCenter = side === 'offense' && label.toUpperCase() === 'C';
  const isLinebacker = side === 'defense' && ['B', 'W', 'M', 'F'].includes(label.toUpperCase());
  const sizeClass = picker ? 'h-9 w-9 text-[11px]' : 'h-7 w-7 text-[10px]';
  const bg = side === 'offense' ? 'bg-[#CC0000]' : isLinebacker ? 'bg-[#15803d]' : 'bg-[#003087]';
  return `${sizeClass} ${bg} text-white font-semibold ${isCenter ? 'rounded-md' : 'rounded-full'} inline-flex items-center justify-center`;
}

export function CanvasToolbar({
  name,
  onNameChange,
  onBack,
  onSave,
  onDelete,
  onExportPng,
  onMirror,
  onInsertPlayer,
  onApplyPreset,
  offensePresetNames,
  defensePresetNames,
  onDeleteSelected
}: {
  name: string;
  onNameChange: (next: string) => void;
  onBack: () => void;
  onSave: () => void;
  onDelete?: () => void;
  onExportPng?: () => void;
  onMirror?: () => void;
  onInsertPlayer: (token: PlayerToken) => void;
  onApplyPreset: (presetName: string, side: 'offense' | 'defense') => void;
  offensePresetNames: string[];
  defensePresetNames: string[];
  onDeleteSelected: () => void;
}) {
  const [active, setActive] = useAtom(activeToolAtom);
  const [drawer, setDrawer] = useState<DrawerTab>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(name);

  useEffect(() => setDraftName(name), [name]);

  const presets = useMemo<PresetButton[]>(
    () => [
      ...offensePresetNames.map((p) => ({ name: p, side: 'offense' as const })),
      ...defensePresetNames.map((p) => ({ name: p, side: 'defense' as const }))
    ],
    [offensePresetNames, defensePresetNames]
  );

  return (
    <>
      <header className="no-print relative z-30 flex h-11 items-center justify-between border-b border-white/10 bg-[#0A0A1A] px-3 text-white">
        <button onClick={onBack} className="rounded-md p-2 text-slate-200 hover:bg-white/10" aria-label="Back to plays">
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="mx-2 min-w-0 flex-1 text-center">
          {editingName ? (
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={() => {
                const trimmed = draftName.trim() || 'Untitled Play';
                onNameChange(trimmed);
                setEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const trimmed = draftName.trim() || 'Untitled Play';
                  onNameChange(trimmed);
                  setEditingName(false);
                }
                if (e.key === 'Escape') {
                  setDraftName(name);
                  setEditingName(false);
                }
              }}
              className="w-full rounded-md border border-white/20 bg-white/10 px-2 py-1 text-center text-sm text-white outline-none"
            />
          ) : (
            <button onClick={() => setEditingName(true)} className="max-w-full truncate text-sm font-semibold text-white/95">
              {name}
            </button>
          )}
        </div>

        <div className="relative flex items-center gap-1">
          <button onClick={onSave} className="rounded-md p-2 text-[#CC0000] hover:bg-white/10" aria-label="Save play">
            <Save className="h-4 w-4" />
          </button>
          <button onClick={() => setMenuOpen((v) => !v)} className="rounded-md p-2 text-slate-200 hover:bg-white/10" aria-label="More options">
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-10 w-44 overflow-hidden rounded-md border border-white/10 bg-[#111125] shadow-xl">
              {onMirror ? <button onClick={() => { onMirror(); setMenuOpen(false); }} className="block w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10">Mirror Play</button> : null}
              {onExportPng ? <button onClick={() => { onExportPng(); setMenuOpen(false); }} className="block w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10">Export PNG</button> : null}
              {onDelete ? <button onClick={() => { onDelete(); setMenuOpen(false); }} className="block w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/20">Delete Play</button> : null}
            </div>
          ) : null}
        </div>
      </header>

      <div
        onClick={() => setDrawer(null)}
        className={`no-print fixed inset-0 z-10 bg-black/30 transition-opacity ${drawer ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      <div className={`no-print fixed inset-x-0 bottom-14 z-20 px-3 transition-transform duration-200 ease-out ${drawer ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}>
        <div className="max-h-[36vh] overflow-y-auto rounded-t-xl border border-white/10 bg-[rgba(10,10,26,0.95)] p-3 text-white backdrop-blur-md">
          {drawer === 'offense' ? (
            <div className="grid grid-cols-6 gap-2">
              {offenseTokens.map((token) => (
                <button
                  key={`off-${token.label}`}
                  onClick={() => {
                    onInsertPlayer(token);
                    setDrawer(null);
                  }}
                  className="flex flex-col items-center gap-1 rounded-lg border border-white/10 p-2 hover:bg-white/10"
                >
                  <span className={tokenClasses(token.label, token.side, true)}>{token.label}</span>
                </button>
              ))}
            </div>
          ) : null}

          {drawer === 'defense' ? (
            <div className="grid grid-cols-6 gap-2">
              {defenseTokens.map((token) => (
                <button
                  key={`def-${token.label}`}
                  onClick={() => {
                    onInsertPlayer(token);
                    setDrawer(null);
                  }}
                  className="flex flex-col items-center gap-1 rounded-lg border border-white/10 p-2 hover:bg-white/10"
                >
                  <span className={tokenClasses(token.label, token.side, true)}>{token.label}</span>
                </button>
              ))}
            </div>
          ) : null}

          {drawer === 'presets' ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {presets.map((preset) => (
                <button
                  key={`${preset.side}-${preset.name}`}
                  onClick={() => {
                    onApplyPreset(preset.name, preset.side);
                    setDrawer(null);
                  }}
                  className={`rounded-md border px-3 py-2 text-sm font-medium text-white hover:brightness-110 ${preset.side === 'offense' ? 'border-[#CC0000]/30 bg-[#CC0000]/20' : 'border-[#003087]/40 bg-[#003087]/25'}`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <footer className="no-print fixed inset-x-0 bottom-0 z-30 flex h-14 items-center justify-between border-t border-white/10 bg-[#0A0A1A] px-2 text-white">
        <div className="flex items-center gap-1 overflow-x-auto pr-2">
          {tools.map((t) => {
            const Icon = t.icon;
            const activeClass = active === t.key ? 'bg-[#CC0000] text-white' : 'bg-transparent text-slate-300 hover:bg-white/10';
            return (
              <button key={t.key} onClick={() => setActive(t.key)} title={`${t.label} (${t.shortcut})`} className={`rounded-full p-2 ${activeClass}`}>
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
          <button onClick={onDeleteSelected} title="Delete selected (Del)" className="rounded-full p-2 text-slate-300 hover:bg-white/10">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 text-sm font-medium">
          <button onClick={() => setDrawer((v) => (v === 'offense' ? null : 'offense'))} className={`rounded-md px-2 py-1 ${drawer === 'offense' ? 'bg-[#CC0000] text-white' : 'bg-white/5 text-slate-200'}`}>Offense ?</button>
          <button onClick={() => setDrawer((v) => (v === 'defense' ? null : 'defense'))} className={`rounded-md px-2 py-1 ${drawer === 'defense' ? 'bg-[#003087] text-white' : 'bg-white/5 text-slate-200'}`}>Defense ?</button>
          <button onClick={() => setDrawer((v) => (v === 'presets' ? null : 'presets'))} className={`rounded-md px-2 py-1 ${drawer === 'presets' ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-200'}`}>Presets ?</button>
        </div>
      </footer>
    </>
  );
}
