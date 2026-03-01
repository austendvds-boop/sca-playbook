"use client";
import { Play, PlayCardLayout } from '@/lib/store';
import { EditableText } from '@/components/shared/EditableText';
import { DiagramSlot } from './DiagramSlot';
import { defaultPlayCardLayout } from '@/lib/installSheet';

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
  const diagrams = layout.diagrams.length >= 2 ? layout.diagrams.slice(0, 2) : defaultPlayCardLayout.diagrams.map((d, i) => ({ ...d, ...(layout.diagrams[i] || {}) }));
  const assignments = defaultPlayCardLayout.assignments.map((row, i) => ({ position: row.position, assignment: layout.assignments[i]?.assignment ?? '' }));

  const patchDiagram = (index: number, next: Partial<PlayCardLayout['diagrams'][number]>) => {
    const nextDiagrams = [...diagrams];
    nextDiagrams[index] = { ...nextDiagrams[index], ...next };
    onChange({ ...layout, diagrams: nextDiagrams });
  };

  return (
    <div className='space-y-0 border-2 border-[#003087] bg-white'>
      <div className='grid grid-cols-1 divide-y-2 divide-white bg-[#003087] text-sm font-bold text-white md:grid-cols-[1fr_1fr_2fr] md:divide-x-2 md:divide-y-0'>
        <div className='px-3 py-2'>
          <span className='mr-1 font-black'>FAMILY:</span>
          <EditableText value={layout.family} placeholder='________' onSave={(family) => onChange({ ...layout, family })} className='inline min-h-6' />
        </div>
        <div className='px-3 py-2'>
          <span className='mr-1 font-black'>CONCEPT:</span>
          <EditableText value={layout.concept} placeholder='________' onSave={(concept) => onChange({ ...layout, concept })} className='inline min-h-6' />
        </div>
        <div className='px-3 py-2'>
          <span className='mr-1 font-black'>SITUATION:</span>
          <EditableText value={layout.description} placeholder='e.g. 2nd & 8, +40' onSave={(description) => onChange({ ...layout, description })} className='inline min-h-6' />
        </div>
      </div>

      <div className='border-t-2 border-[#003087] px-3 py-3 text-3xl font-black text-[#CC0000]'>
        <span className='mr-2'>PLAY:</span>
        <EditableText value={layout.playName} placeholder='____________________' onSave={(playName) => onChange({ ...layout, playName })} className='inline' />
      </div>

      <div className='grid grid-cols-1 border-y-2 border-[#003087] md:grid-cols-2'>
        {diagrams.map((d, i) => (
          <div key={d.key} className={i === 0 ? 'border-b-2 border-[#003087] md:border-b-0 md:border-r-2' : ''}>
            <DiagramSlot
              play={d.playId ? playMap.get(d.playId) : undefined}
              labelTop={d.labelTop}
              labelBottom={d.labelBottom}
              showBottomLabel={false}
              onLabelTop={(v) => patchDiagram(i, { labelTop: v })}
              onLabelBottom={(v) => patchDiagram(i, { labelBottom: v })}
              onRemove={() => patchDiagram(i, { playId: null })}
              onAddPlay={() => onPickPlay?.(i)}
            />
          </div>
        ))}
      </div>

      <div className='border-b-2 border-[#003087]'>
        <div className='grid grid-cols-[120px_1fr] bg-[#003087] px-3 py-2 text-sm font-black text-white'>
          <div>POSITION</div>
          <div>ASSIGNMENT</div>
        </div>
        {assignments.map((row, i) => (
          <div key={`${row.position}-${i}`} className='grid grid-cols-[120px_1fr] border-t border-[#003087] px-3 py-2 text-sm'>
            <div className='font-black text-[#003087]'>{row.position}</div>
            <EditableText
              value={row.assignment}
              placeholder=''
              onSave={(assignment) => {
                const next = [...assignments];
                next[i] = { ...next[i], assignment };
                onChange({ ...layout, assignments: next });
              }}
              className='font-semibold text-[#003087]'
            />
          </div>
        ))}
      </div>

      <div className='px-3 py-2'>
        <div className='mb-2 text-sm font-black text-[#003087]'>NOTES</div>
        <EditableText
          value={layout.notes}
          onSave={(notes) => onChange({ ...layout, notes })}
          multiline
          className='min-h-20 w-full border border-[#003087] p-2 text-sm font-semibold text-[#003087]'
        />
      </div>
    </div>
  );
}

