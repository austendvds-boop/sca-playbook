"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Doc={id:string;name:string;docType:string;updatedAt:string};
export default function DocumentsPage(){ const [docs,setDocs]=useState<Doc[]>([]); useEffect(()=>{fetch('/api/documents').then(r=>r.json()).then(d=>setDocs(d.data||[]));},[]); return <main className='p-6'><div className='flex justify-between items-center mb-4'><h1 className='text-2xl font-bold text-[#003087]'>Documents</h1><Link href='/documents/new' className='bg-[#CC0000] text-white rounded px-3 py-2'>New Document</Link></div><div className='grid gap-3'>{docs.map(d=><Link key={d.id} href={`/documents/${d.id}`} className='bg-white border rounded p-3'>{d.name} <span className='text-xs uppercase'>{d.docType}</span></Link>)}</div></main>; }
