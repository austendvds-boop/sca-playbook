"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type Doc = { id: string; name: string; docType: string; updatedAt: string; layoutData?: { diagrams?: Array<{ playId: string | null }> } };
type Play = { id: string; name: string };

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const router = useRouter();

  const load = () => {
    fetch('/api/documents').then((r) => r.json()).then((d) => setDocs(d.data || []));
    fetch('/api/plays').then((r) => r.json()).then((d) => setPlays(d.data || []));
  };
  useEffect(() => {
    load();
  }, []);

  const playMap = useMemo(() => new Map(plays.map((p) => [p.id, p.name])), [plays]);

  const createDoc = async (docType: 'play_card' | 'reference_sheet') => {
    const r = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docType, name: docType === 'play_card' ? 'New Install Sheet' : 'Reference Sheet' })
    });
    const d = await r.json();
    router.push(`/documents/${d.data.id}`);
  };

  return (
    <main className='p-6'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
        <h1 className='text-3xl font-black uppercase text-[#003087]'>Install Sheets</h1>
        <div className='flex gap-2'>
          <button onClick={() => createDoc('play_card')} className='rounded bg-[#CC0000] px-3 py-2 font-black uppercase text-white'>
            New Install Sheet
          </button>
        </div>
      </div>
      <div className='grid gap-3'>
        {docs.map((d) => {
          const assignedPlayId = d.layoutData?.diagrams?.find((x) => x.playId)?.playId ?? null;
          const assignedPlayName = assignedPlayId ? playMap.get(assignedPlayId) : null;
          return (
            <Link key={d.id} href={`/documents/${d.id}`} className='rounded border-2 border-[#003087] bg-white p-3'>
              <div className='text-lg font-black uppercase text-[#003087]'>{d.name}</div>
              <div className='text-sm font-bold uppercase text-[#CC0000]'>
                {assignedPlayName ? `Play: ${assignedPlayName}` : 'Play: Not assigned'}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

