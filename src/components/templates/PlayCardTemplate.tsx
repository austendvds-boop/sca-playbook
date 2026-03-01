"use client";
import { Play, PlayCardLayout } from '@/lib/store';
import { EditableText } from '@/components/shared/EditableText';
import { DiagramSlot } from './DiagramSlot';

const defaultRows = ['QB', 'RB', 'FB', 'WR (X)', 'WR (Z)', 'WR (H)', 'TE (Y)', 'LT', 'LG', 'C', 'RG', 'RT'];

export function PlayCardTemplate({
  layout,
  playMap,
  onChange,
  onPickPlay
}: {
  layout: PlayCardLayout;
  playMap: Map<string, Play>;
  onChange: (next: PlayCardLayout) => void;
  onPickPlay?: (diagramIndex: number) => void;
}) {
  const sourceRows = layout.assignments.length ? layout.assignments : defaultRows.map((position) => ({ position, assignment: '' }));

  const ensureSecondDiagram = () => {
    if (layout.diagrams.length >= 2) return layout.diagrams;
    return [...layout.diagrams, { key: `diagram_${layout.diagrams.length + 1}`, playId: null, labelTop: '', labelBottom: '' }];
  };

  return (
    <div className="space-y-3 bg-white p-3">
      <div className="flex items-center justify-between rounded bg-[#003087] px-3 py-2 text-white">
        <div className="flex items-center gap-3">
          <img src="/sca-logo.png" alt="SCA Eagles" className="h-10 w-10 object-contain" />
          <div className="text-base font-extrabold uppercase tracking-wide">SCA Eagles Football</div>
        </div>
        <div className="text-sm font-black uppercase tracking-wide">Install Sheet</div>
      </div>

      <div className="flex justify-between bg-[#CC0000] p-2 text-sm font-extrabold uppercase text-white">
        <EditableText value={`Family: ${layout.family}`} onSave={(v) => onChange({ ...layout, family: v.replace('Family: ', '') })} />
        <EditableText value={`Concept: ${layout.concept}`} onSave={(v) => onChange({ ...layout, concept: v.replace('Concept: ', '') })} />
      </div>

      <EditableText value={layout.playName} onSave={(playName) => onChange({ ...layout, playName })} className="text-4xl font-black uppercase text-[#CC0000]" />
      <EditableText value={layout.description} onSave={(description) => onChange({ ...layout, description })} className="text-sm font-bold uppercase text-[#003087]" />

      <div className="space-y-3">
        {layout.diagrams.map((d, i) => (
          <DiagramSlot
            key={d.key}
            play={d.playId ? playMap.get(d.playId) : undefined}
            labelTop={d.labelTop}
            labelBottom={d.labelBottom}
            onLabelTop={(v) => {
              const diagrams = [...layout.diagrams];
              diagrams[i] = { ...d, labelTop: v };
              onChange({ ...layout, diagrams });
            }}
            onLabelBottom={(v) => {
              const diagrams = [...layout.diagrams];
              diagrams[i] = { ...d, labelBottom: v };
              onChange({ ...layout, diagrams });
            }}
            onRemove={() => {
              const diagrams = [...layout.diagrams];
              diagrams[i] = { ...d, playId: null };
              onChange({ ...layout, diagrams });
            }}
            onAddPlay={() => onPickPlay?.(i)}
          />
        ))}
      </div>

      <div className="no-print flex justify-end">
        {layout.diagrams.length < 2 ? (
          <button
            type="button"
            onClick={() => onChange({ ...layout, diagrams: ensureSecondDiagram() })}
            className="rounded bg-[#003087] px-3 py-2 text-sm font-black uppercase text-white"
          >
            Add Second Diagram
          </button>
        ) : null}
      </div>

      <div className="rounded border-2 border-[#003087]">
        <div className="grid grid-cols-[170px_1fr_48px] bg-[#003087] p-2 text-xs font-black uppercase text-white">
          <div>Position</div>
          <div>Assignment</div>
          <div />
        </div>
        {sourceRows.map((r, i) => (
          <div key={`${r.position}-${i}`} className="grid grid-cols-[170px_1fr_48px] border-t-2 border-[#003087] p-2 text-sm">
            <EditableText
              value={r.position}
              onSave={(v) => {
                const next = [...sourceRows];
                next[i] = { ...r, position: v };
                onChange({ ...layout, assignments: next });
              }}
              className="font-extrabold uppercase text-[#003087]"
            />
            <EditableText
              value={r.assignment}
              onSave={(v) => {
                const next = [...sourceRows];
                next[i] = { ...r, assignment: v };
                onChange({ ...layout, assignments: next });
              }}
              className="font-semibold text-[#003087]"
            />
            <button
              type="button"
              onClick={() => {
                const next = sourceRows.filter((_, idx) => idx !== i);
                onChange({ ...layout, assignments: next });
              }}
              className="rounded border-2 border-[#CC0000] px-2 text-sm font-black text-[#CC0000]"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="no-print flex justify-start">
        <button
          type="button"
          onClick={() => onChange({ ...layout, assignments: [...sourceRows, { position: 'NEW', assignment: '' }] })}
          className="rounded bg-[#CC0000] px-3 py-2 text-sm font-black uppercase text-white"
        >
          Add Position
        </button>
      </div>

      <div>
        <div className="mb-1 text-xs font-black uppercase text-[#003087]">Notes</div>
        <EditableText value={layout.notes} onSave={(notes) => onChange({ ...layout, notes })} className="min-h-16 rounded border-2 border-[#003087] p-2 text-sm font-semibold text-[#003087]" />
      </div>
    </div>
  );
}


