"use client";

import { useRouter } from 'next/navigation';

export default function NewDocumentPage() {
  const router = useRouter();
  const create = async (type: 'play_card' | 'reference_sheet') => {
    const r = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docType: type, name: type === 'play_card' ? 'New Install Sheet' : 'Reference Sheet' })
    });
    const d = await r.json();
    router.push(`/documents/${d.data.id}`);
  };

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-3xl font-black uppercase text-[#003087]">Create Install Sheet</h1>
      <div className="flex gap-3">
        <button className="rounded bg-[#CC0000] px-4 py-2 font-black uppercase text-white" onClick={() => create('play_card')}>
          New Install Sheet
        </button>
      </div>
    </main>
  );
}

