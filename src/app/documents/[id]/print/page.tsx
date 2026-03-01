"use client";
import { useEffect, useMemo, useState } from 'react';
import { DocumentRec, Play, PlayCardLayout } from '@/lib/store';
import { PlaySVGRenderer } from '@/components/shared/PlaySVGRenderer';

export default function PrintDoc({ params }: { params: { id: string } }) {
  const [doc, setDoc] = useState<DocumentRec | null>(null);
  const [plays, setPlays] = useState<Play[]>([]);

  useEffect(() => {
    fetch(`/api/documents/${params.id}`).then((r) => r.json()).then((d) => setDoc(d.data));
    fetch('/api/plays').then((r) => r.json()).then((d) => setPlays(d.data || []));
    setTimeout(() => window.print(), 450);
  }, [params.id]);

  const playMap = useMemo(() => new Map(plays.map((p) => [p.id, p])), [plays]);

  if (!doc || doc.docType !== 'play_card') return null;

  const layout = doc.layoutData as PlayCardLayout;
  const selectedDiagram = layout.diagrams.find((d) => d.playId) ?? layout.diagrams[0];
  const selectedPlay = selectedDiagram?.playId ? playMap.get(selectedDiagram.playId) : undefined;

  return (
    <main className='p-6 text-[#003087]'>
      <style jsx global>{`
        @media print {
          @page { size: letter portrait; margin: 0.4in; }
          html, body { margin: 0 !important; padding: 0 !important; }
        }
      `}</style>

      <header className='mb-4 flex items-center justify-between border-b-4 border-[#003087] pb-3'>
        <div className='flex items-center gap-3'>
          <img src='/sca-logo.png' alt='SCA Eagles' className='h-14 w-14 object-contain' />
          <div className='text-sm font-black uppercase tracking-wide text-[#003087]'>SCA Eagles Football</div>
        </div>
        <div className='text-xl font-black uppercase text-[#003087]'>Install Sheet</div>
      </header>

      <h1 className='mb-4 text-4xl font-black uppercase text-[#CC0000]'>{layout.playName || doc.name}</h1>

      <section className='mb-4 border-4 border-[#003087] p-2'>
        {selectedPlay ? (
          <PlaySVGRenderer elements={selectedPlay.canvasData} className='h-[360px] w-full' />
        ) : (
          <div className='flex h-[360px] items-center justify-center text-lg font-black uppercase text-[#003087]'>No Play Selected</div>
        )}
      </section>

      <section className='mb-4 border-2 border-[#003087]'>
        <div className='grid grid-cols-[180px_1fr] bg-[#003087] p-2 text-xs font-black uppercase text-white'>
          <div>Position</div>
          <div>Assignment</div>
        </div>
        {(layout.assignments || []).map((row, i) => (
          <div key={`${row.position}-${i}`} className='grid grid-cols-[180px_1fr] border-t-2 border-[#003087] p-2 text-sm'>
            <div className='font-black uppercase text-[#003087]'>{row.position}</div>
            <div className='font-medium text-[#003087]'>{row.assignment || ' '}</div>
          </div>
        ))}
      </section>

      <section>
        <div className='mb-1 text-xs font-black uppercase text-[#003087]'>Notes</div>
        <div className='min-h-20 border-2 border-[#003087] p-2 text-sm font-medium text-[#003087]'>{layout.notes || ' '}</div>
      </section>

      <footer className='mt-6 border-t-2 border-[#003087] pt-3 text-center'>
        <p className='text-xs italic text-[#003087]'>
          "Then I heard the voice of the Lord saying, 'Whom shall I send? And who will go for us?' And I said, 'Here am I. Send me!'" — Isaiah 6:8
        </p>
      </footer>
    </main>
  );
}

