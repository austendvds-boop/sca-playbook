"use client";
import { useEffect, useState } from 'react';
import { PlaySVGRenderer } from '@/components/shared/PlaySVGRenderer';

export default function DocEdit({params}:{params:{id:string}}){ const [doc,setDoc]=useState<any>(null); const [plays,setPlays]=useState<any[]>([]);
useEffect(()=>{fetch(`/api/documents/${params.id}`).then(r=>r.json()).then(d=>setDoc(d.data)); fetch('/api/plays').then(r=>r.json()).then(d=>setPlays(d.data||[]));},[params.id]);
if(!doc) return <main className='p-6'>Loading...</main>;
const save=async(next:any)=>{setDoc(next); await fetch(`/api/documents/${params.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)});};
return <main className='p-6 space-y-4'><div className='bg-[#CC0000] text-white p-3 font-bold flex justify-between'><span>FAMILY: {doc.layoutData.family||'SCA'}</span><span>CONCEPT: {doc.layoutData.concept||''}</span></div><input className='border p-2 w-full text-xl font-bold' value={doc.layoutData.playName||''} onChange={e=>save({...doc,layoutData:{...doc.layoutData,playName:e.target.value}})} placeholder='PLAY' />
<div className='grid md:grid-cols-2 gap-3'>{(doc.layoutData.diagrams||[]).map((s:any,idx:number)=>{ const p=plays.find(x=>x.id===s.playId); return <div key={s.key} className='border-2 border-dashed p-2'><select className='border p-1 w-full mb-2' value={s.playId||''} onChange={e=>{const diagrams=[...doc.layoutData.diagrams]; diagrams[idx]={...s,playId:e.target.value||null}; save({...doc,layoutData:{...doc.layoutData,diagrams}});}}><option value=''>Select play</option>{plays.map(pl=><option key={pl.id} value={pl.id}>{pl.name}</option>)}</select>{p?<PlaySVGRenderer elements={p.canvasData} className='w-full h-48'/>:<div className='h-48'/>}</div>})}</div>
<a className='inline-block bg-[#003087] text-white px-3 py-2 rounded' href={`/documents/${params.id}/print`} target='_blank'>Print View</a></main>;
}
