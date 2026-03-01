"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Play={id:string;name:string;tags:string[];updatedAt:string};
export default function PlaysPage(){
 const [plays,setPlays]=useState<Play[]>([]); const [q,setQ]=useState('');
 useEffect(()=>{fetch('/api/plays').then(r=>r.json()).then(d=>setPlays(d.data||[]));},[]);
 const filtered=plays.filter(p=>p.name.toLowerCase().includes(q.toLowerCase()));
 return <main className="p-6"><div className="flex justify-between items-center mb-4"><h1 className="text-2xl font-bold text-[#003087]">Play Library</h1><Link className="bg-[#CC0000] text-white px-3 py-2 rounded" href="/plays/new">New Play</Link></div><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search" className="border px-3 py-2 rounded w-full mb-4"/><div className="grid md:grid-cols-3 gap-4">{filtered.map(p=><Link key={p.id} href={`/plays/${p.id}`} className="bg-white border rounded p-3"><h3 className="font-semibold">{p.name}</h3><p className="text-xs text-gray-500">{new Date(p.updatedAt).toLocaleString()}</p></Link>)}</div></main>
}
