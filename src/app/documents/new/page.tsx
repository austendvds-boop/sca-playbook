"use client";

import { useRouter } from 'next/navigation';

export default function NewDocumentPage() {
  const router = useRouter();
  const create = async (type: 'play_card' | 'reference_sheet') => {
    const r = await fetch('/api/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ docType: type, name: type === 'play_card' ? 'Play Card' : 'Reference Sheet' }) });
    const d = await r.json();
    router.push(`/documents/${d.data.id}`);
  };
  return <main className="mx-auto max-w-3xl p-6"><h1 className="mb-4 text-2xl font-bold text-[#003087]">Create Document</h1><div className="flex gap-3"><button className="rounded bg-[#CC0000] px-4 py-2 text-white" onClick={() => create('play_card')}>Play Card</button><button className="rounded bg-slate-200 px-4 py-2" onClick={() => create('reference_sheet')}>Reference Sheet</button></div></main>;
}
