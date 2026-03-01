"use client";

import { useAtom } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronsRight,
  Hexagon,
  MousePointer2,
  MoveRight,
  MoreHorizontal,
  MoreVertical,
  Save,
  Trash2,
  Type
} from 'lucide-react';
import { activeToolAtom, Tool } from '@/atoms/canvas';

type DrawerTab = 'offense' | 'defense' | 'presets';

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
  { label: 'QB', side: 'offense' },
  { label: 'RB', side: 'offense' },
  { label: 'FB', side: 'offense' },
  { label: 'X', side: 'offense' },
  { label: 'Z', side: 'offense' },
  { label: 'H', side: 'offense' },
  { label: 'Y', side: 'offense' },
  { label: 'WR', side: 'offense' }
];

const defenseTokens: PlayerToken[] = [
  { label: 'DE', side: 'defense' },
  { label: 'DT', side: 'defense' },
  { label: 'NT', side: 'defense' },
  { label: 'W', side: 'defense' },
  { label: 'M', side: 'defense' },
  { label: 'S', side: 'defense' },
  { label: 'B', side: 'defense' },
  { label: 'F', side: 'defense' },
  { label: 'CB', side: 'defense' },
  { label: 'SS', side: 'defense' },
  { label: 'FS', side: 'defense' },
  { label: '$', side: 'defense' }
];

function tokenClasses(label: string, side: 'offense' | 'defense') {
  const isCenter = side === 'offense' && label.toUpperCase() === 'C';
  const isLinebacker = side === 'defense' && ['W', 'M', 'S', 'B', 'F'].includes(label.toUpperCase());
  const bg = side === 'offense' ? 'bg-[#CC0000]' : isLinebacker ? 'bg-[#15803d]' : 'bg-[#003087]';
  return `h-9 w-9 ${bg} text-white text-[11px] font-semibold ${isCenter ? 'rounded-md' : 'rounded-full'} inline-flex items-center justify-center`;
}

function OLGroupIcon() {
  return (
    <svg width="44" height="16" viewBox="0 0 44 16" fill="none" aria-hidden="true">
      <circle cx="4" cy="8" r="3" fill="#ffffff" fillOpacity="0.92" />
      <circle cx="13" cy="8" r="3" fill="#ffffff" fillOpacity="0.92" />
      <rect x="19" y="5" width="6" height="6" rx="1" fill="#ffffff" fillOpacity="0.92" />
      <circle cx="31" cy="8" r="3" fill="#ffffff" fillOpacity="0.92" />
      <circle cx="40" cy="8" r="3" fill="#ffffff" fillOpacity="0.92" />
    </svg>
  );
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
  onInsertOLGroup,
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
  onInsertOLGroup: () => void;
  onApplyPreset: (presetName: string, side: 'offense' | 'defense') => void;
  offensePresetNames: string[];
  defensePresetNames: string[];
  onDeleteSelected: () => void;
}) {
  const [active, setActive] = useAtom(activeToolAtom);
  const [activeTab, setActiveTab] = useState<DrawerTab>('offense');
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
      <header className="no-print relative z-30 flex h-11 flex-shrink-0 items-center justify-between border-b border-white/10 bg-[#0A0A1A] px-3 text-white">
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

      <section className="no-print z-30 flex h-16 flex-shrink-0 items-center border-t border-white/10 bg-[#0E1022] px-2 text-white">
        {activeTab === 'offense' ? (
          <div className="flex w-full items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={onInsertOLGroup}
              className="inline-flex h-11 min-w-[72px] items-center justify-center rounded-full border border-[#CC0000]/70 bg-[#CC0000] px-3 hover:brightness-110"
              title="OL Group"
            >
              <OLGroupIcon />
            </button>
            {offenseTokens.map((token) => (
              <button
                key={`off-${token.label}`}
                onClick={() => onInsertPlayer(token)}
                className="inline-flex h-11 min-w-[44px] items-center justify-center"
                title={`Add ${token.label}`}
              >
                <span className={tokenClasses(token.label, token.side)}>{token.label}</span>
              </button>
            ))}
          </div>
        ) : null}

        {activeTab === 'defense' ? (
          <div className="flex w-full items-center gap-2 overflow-x-auto pb-1">
            {defenseTokens.map((token) => (
              <button
                key={`def-${token.label}`}
                onClick={() => onInsertPlayer(token)}
                className="inline-flex h-11 min-w-[44px] items-center justify-center"
                title={`Add ${token.label}`}
              >
                <span className={tokenClasses(token.label, token.side)}>{token.label}</span>
              </button>
            ))}
          </div>
        ) : null}

        {activeTab === 'presets' ? (
          <div className="grid max-h-[58px] w-full grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-6 md:grid-cols-9">
            {presets.map((preset) => (
              <button
                key={`${preset.side}-${preset.name}`}
                onClick={() => onApplyPreset(preset.name, preset.side)}
                className={`rounded-md border px-2 py-1 text-xs font-medium text-white hover:brightness-110 ${preset.side === 'offense' ? 'border-[#CC0000]/30 bg-[#CC0000]/20' : 'border-[#003087]/40 bg-[#003087]/25'}`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <footer className="no-print z-30 flex h-[52px] flex-shrink-0 items-center justify-between border-t border-white/10 bg-[#0A0A1A] px-2 text-white">
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
          <button onClick={onDeleteSelected} title="Delete selected" className="rounded-full p-2 text-slate-300 hover:bg-white/10">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 text-sm font-medium">
          <button onClick={() => setActiveTab('offense')} className={`rounded-md px-2 py-1 ${activeTab === 'offense' ? 'bg-[#CC0000] text-white' : 'bg-white/5 text-slate-200'}`}>Offense</button>
          <button onClick={() => setActiveTab('defense')} className={`rounded-md px-2 py-1 ${activeTab === 'defense' ? 'bg-[#CC0000] text-white' : 'bg-white/5 text-slate-200'}`}>Defense</button>
          <button onClick={() => setActiveTab('presets')} className={`rounded-md px-2 py-1 ${activeTab === 'presets' ? 'bg-[#CC0000] text-white' : 'bg-white/5 text-slate-200'}`}>Presets</button>
        </div>
      </footer>
    </>
  );
}
