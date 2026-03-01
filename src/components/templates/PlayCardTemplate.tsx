"use client";
import { Play, PlayCardLayout } from '@/lib/store';
import { EditableText } from '@/components/shared/EditableText';
import { DiagramSlot } from './DiagramSlot';

const defaultRows = ['PST', 'PSG', 'OC', 'BSG', 'BST', 'Y', 'X', 'Z', 'H/S', 'A', 'QB'];

export function PlayCardTemplate({ layout, playMap, onChange }: { layout: PlayCardLayout; playMap: Map<string, Play>; onChange: (next: PlayCardLayout) => void }) {
  const assignments = defaultRows.map((position) => layout.assignments.find((r) => r.position === position) ?? { position, assignment: '' });

  return (
    <div className='space-y-3 bg-white p-3'>
      <div className='flex items-center justify-between rounded bg-[#003087] px-3 py-2 text-white'>
        <div className='flex items-center gap-2'>
          <img src='/sca-logo.png' alt='SCA Eagles' className='h-7 w-7 object-contain' />
          <div className='text-sm font-semibold'>SCA Eagles Playbook</div>
        </div>
      </div>

      <div className='flex justify-between bg-[#CC0000] p-2 text-sm font-bold text-white'>
        <EditableText value={`FAMILY: ${layout.family}`} onSave={(v)=>onChange({...layout,family:v.replace('FAMILY: ','')})}/>
        <EditableText value={`CONCEPT: ${layout.concept}`} onSave={(v)=>onChange({...layout,concept:v.replace('CONCEPT: ','')})}/>
      </div>

      <EditableText value={`PLAY: ${layout.playName}`} onSave={(v)=>onChange({...layout,playName:v.replace('PLAY: ','')})} className='text-2xl font-bold'/>
      <EditableText value={layout.description} onSave={(description)=>onChange({...layout,description})} className='text-sm text-slate-600'/>

      <div className='grid gap-3 md:grid-cols-2'>
        {layout.diagrams.slice(0,2).map((d,i)=><DiagramSlot key={d.key} play={d.playId?playMap.get(d.playId):undefined} labelTop={d.labelTop} labelBottom={d.labelBottom} onLabelTop={(v)=>{const diagrams=[...layout.diagrams]; diagrams[i]={...d,labelTop:v}; onChange({...layout,diagrams});}} onLabelBottom={(v)=>{const diagrams=[...layout.diagrams]; diagrams[i]={...d,labelBottom:v}; onChange({...layout,diagrams});}} onRemove={()=>{const diagrams=[...layout.diagrams]; diagrams[i]={...d,playId:null}; onChange({...layout,diagrams});}}/> )}
      </div>

      <div className='rounded border'>
        <div className='grid grid-cols-[120px_1fr] bg-slate-100 p-2 text-xs font-bold'><div>Position</div><div>Assignment</div></div>
        {assignments.map((r,i)=><div key={r.position} className='grid grid-cols-[120px_1fr] border-t p-2 text-sm'><div className='font-bold'>{r.position}</div><EditableText value={r.assignment} onSave={(v)=>{const next=[...assignments]; next[i]={...r,assignment:v}; onChange({...layout,assignments:next});}}/></div>)}
      </div>

      <div>
        <div className='mb-1 text-xs font-bold uppercase'>Notes</div>
        <EditableText value={layout.notes} onSave={(notes)=>onChange({...layout,notes})} className='min-h-16 rounded border p-2 text-sm'/>
      </div>
    </div>
  );
}
