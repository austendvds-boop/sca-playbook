"use client";
import { useEffect, useMemo, useState } from 'react';
import { DocumentRec, Play, PlayCardLayout, ReferenceLayout } from '@/lib/store';
import { PlayCardTemplate } from '@/components/templates/PlayCardTemplate';
import { ReferenceSheetTemplate } from '@/components/templates/ReferenceSheetTemplate';

export default function DocEdit({ params }: { params: { id: string } }) {
  const [doc, setDoc] = useState<DocumentRec | null>(null);
  const [plays, setPlays] = useState<Play[]>([]);
  useEffect(() => { fetch(`/api/documents/${params.id}`).then((r) => r.json()).then((d) => setDoc(d.data)); fetch('/api/plays').then((r) => r.json()).then((d) => setPlays(d.data || [])); }, [params.id]);
  useEffect(() => { if (!doc) return; const t = setTimeout(() => { fetch(`/api/documents/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(doc) }); }, 2000); return () => clearTimeout(t); }, [doc, params.id]);
  const playMap = useMemo(() => new Map(plays.map((p) => [p.id, p])), [plays]);
  if (!doc) return <main className='p-6'>Loading...</main>;
  return <main className='mx-auto max-w-6xl p-6 space-y-3'><div className='no-print flex gap-2'><button className='rounded bg-[#003087] px-3 py-2 text-white' onClick={() => fetch(`/api/documents/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(doc) })}>Save</button><button className='rounded border px-3 py-2' onClick={() => window.open(`/documents/${params.id}/print`, '_blank')}>Print</button></div>{doc.docType==='play_card' ? <PlayCardTemplate layout={doc.layoutData as PlayCardLayout} playMap={playMap} onChange={(layoutData)=>setDoc({...doc,layoutData})}/> : <ReferenceSheetTemplate layout={doc.layoutData as ReferenceLayout} playMap={playMap} onChange={(layoutData)=>setDoc({...doc,layoutData})}/>}<div className='no-print rounded border p-3'><h3 className='mb-2 font-semibold'>Play Drawer</h3><div className='grid grid-cols-2 gap-2 md:grid-cols-4'>{plays.map((p)=><button key={p.id} className='rounded border px-2 py-1 text-left text-sm' onClick={()=>{ if(doc.docType==='play_card'){const l=doc.layoutData as PlayCardLayout; const idx=l.diagrams.findIndex(x=>!x.playId); if(idx>=0){const diagrams=[...l.diagrams]; diagrams[idx]={...diagrams[idx],playId:p.id}; setDoc({...doc,layoutData:{...l,diagrams}});} } }}>{p.name}</button>)}</div></div></main>;
}
