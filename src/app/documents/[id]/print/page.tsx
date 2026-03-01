"use client";
import { useEffect, useMemo, useState } from 'react';
import { DocumentRec, Play } from '@/lib/store';
import { PlaySVGRenderer } from '@/components/shared/PlaySVGRenderer';
import { normalizePlayCardLayout } from '@/lib/installSheet';

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

  const layout = normalizePlayCardLayout(doc.layoutData);
  const selectedDiagram = layout.diagrams.find((d) => d.playId) ?? layout.diagrams[0];
  const selectedPlay = selectedDiagram?.playId ? playMap.get(selectedDiagram.playId) : undefined;

  return (
    <main className='p-5 text-[#003087]'>
      <style jsx global>{`
        @media print {
          @page { size: letter portrait; margin: 0.45in; }
          html, body { margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <header className='mb-4 flex items-center justify-between bg-[#003087] px-4 py-3 text-white'>
        <img src='/sca-logo.png' alt='SCA Eagles' className='h-14 w-14 object-contain' />
        <div className='text-right text-sm font-black uppercase tracking-wide'>SCA Eagles Football — Install Sheet</div>
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
          <div key={`${row.position}-${i}`} className={`grid grid-cols-[180px_1fr] border-t-2 border-[#003087] p-2 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-[#003087]/10'}`}>
            <div className='font-black uppercase text-[#003087]'>{row.position}</div>
            <div className='font-semibold text-[#003087]'>{row.assignment || ' '}</div>
          </div>
        ))}
      </section>

      <section>
        <div className='mb-1 text-xs font-black uppercase text-[#003087]'>Notes</div>
        <div className='min-h-24 border-2 border-[#003087] p-2 text-sm font-semibold text-[#003087]'>{layout.notes || ' '}</div>
      </section>

      <footer className='mt-6 border-t-2 border-[#003087] pt-3 text-center'>
        <p className='text-xs italic text-[#003087]'>“Here am I. Send me!” — Isaiah 6:8</p>
      </footer>
    </main>
  );
}

