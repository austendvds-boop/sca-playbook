"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Doc={id:string;name:string;docType:string;updatedAt:string};

export default function DocumentsPage(){
  const [docs,setDocs]=useState<Doc[]>([]);
  const router = useRouter();

  const load = () => fetch('/api/documents').then(r=>r.json()).then(d=>setDocs(d.data||[]));
  useEffect(()=>{load();},[]);

  const createDoc = async (docType:'play_card'|'reference_sheet') => {
    const r = await fetch('/api/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ docType, name: docType === 'play_card' ? 'Play Card' : 'Reference Sheet' }) });
    const d = await r.json();
    router.push(`/documents/${d.data.id}`);
  };

  return <main className='p-6'><div className='mb-4 flex flex-wrap items-center justify-between gap-2'><h1 className='text-2xl font-bold text-[#003087]'>Documents</h1><div className='flex gap-2'><button onClick={() => createDoc('play_card')} className='rounded bg-[#CC0000] px-3 py-2 font-semibold text-white'>New Play Card</button><button onClick={() => createDoc('reference_sheet')} className='rounded border px-3 py-2'>New Reference Sheet</button></div></div><div className='grid gap-3'>{docs.map(d=><Link key={d.id} href={`/documents/${d.id}`} className='rounded border bg-white p-3'>{d.name} <span className='text-xs uppercase'>{d.docType}</span></Link>)}</div></main>;
}
