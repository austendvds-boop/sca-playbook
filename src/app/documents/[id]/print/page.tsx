"use client";
import { use, useEffect, useMemo, useState } from 'react';
import { DocumentRec, Play } from '@/lib/store';
import { PlaySVGRenderer } from '@/components/shared/PlaySVGRenderer';
import { normalizePlayCardLayout } from '@/lib/installSheet';

export default function PrintDoc({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [doc, setDoc] = useState<DocumentRec | null>(null);
  const [plays, setPlays] = useState<Play[]>([]);

  useEffect(() => {
    fetch(`/api/documents/${id}`).then((r) => r.json()).then((d) => setDoc(d.data));
    fetch('/api/plays').then((r) => r.json()).then((d) => setPlays(d.data || []));
  }, [id]);

  const playMap = useMemo(() => new Map(plays.map((p) => [p.id, p])), [plays]);

  if (!doc) return <main className='p-5 text-[#003087]'>Loading...</main>;
  if (doc.docType !== 'play_card') return <main className='p-5 text-[#003087]'>Unsupported document.</main>;

  const layout = normalizePlayCardLayout(doc.layoutData);
  const diagrams = layout.diagrams.slice(0, 2);

  return (
    <main className='p-5 text-[#003087]'>
      <style jsx global>{`
        @media print {
          @page { size: letter portrait; margin: 0.5in; }
          html, body { margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          [contenteditable='true'] { outline: none !important; }
        }
      `}</style>

      <div className='no-print mb-3 flex justify-end'>
        <button onClick={() => window.print()} className='rounded border border-[#003087] px-3 py-1.5 text-sm font-semibold text-[#003087] hover:bg-[#003087]/5'>
          Print
        </button>
      </div>

      <header className='mb-3 flex items-center justify-between bg-[#003087] px-4 py-3 text-white'>
        <img src='/sca-logo.png' alt='SCA Eagles' className='h-12 w-12 object-contain' />
        <div className='text-right text-sm font-black uppercase tracking-wide'>SCA Eagles Football — Install Sheet</div>
      </header>

      <div className='mb-2 grid grid-cols-[1fr_1fr_2fr] divide-x-2 divide-white bg-[#003087] text-xs font-bold text-white'>
        <div className='px-3 py-2'>FAMILY: {layout.family || ' '}</div>
        <div className='px-3 py-2'>CONCEPT: {layout.concept || ' '}</div>
        <div className='px-3 py-2'>{layout.description || ' '}</div>
      </div>

      <h1 className='mb-3 text-3xl font-black text-[#CC0000]'>PLAY: {layout.playName || ' '}</h1>

      <section className='mb-3 grid grid-cols-2 border-2 border-[#003087]'>
        {diagrams.map((diagram, i) => {
          const play = diagram.playId ? playMap.get(diagram.playId) : undefined;
          return (
            <div key={diagram.key} className={i === 0 ? 'border-r-2 border-[#003087] p-2' : 'p-2'}>
              <div className='mb-1 text-xs font-black'>{(i === 0 ? layout.slot1Label : layout.slot2Label) || diagram.labelTop || ' '}</div>
              <div className='h-48 border border-[#003087]'>
                {play ? <PlaySVGRenderer elements={play.canvasData} className='h-full w-full' /> : <div className='flex h-full items-center justify-center text-sm font-bold'>No Play</div>}
              </div>
            </div>
          );
        })}
      </section>

      <section className='mb-3 border-2 border-[#003087]'>
        <div className='grid grid-cols-[120px_1fr] bg-[#003087] px-3 py-2 text-xs font-black text-white'>
          <div>POSITION</div>
          <div>ASSIGNMENT</div>
        </div>
        {layout.assignments.map((row, i) => (
          <div key={`${row.position}-${i}`} className='grid grid-cols-[120px_1fr] border-t border-[#003087] px-3 py-2 text-sm'>
            <div className='font-black'>{row.position}</div>
            <div>{row.assignment || ' '}</div>
          </div>
        ))}
      </section>

      <section>
        <div className='mb-1 text-xs font-black'>NOTES</div>
        <div className='min-h-[120px] border-2 border-[#003087] p-2 text-sm'>{layout.notes || ' '}</div>
      </section>

      <footer className='mt-5 border-t-2 border-[#003087] pt-2 text-center'>
        <p className='text-xs italic text-[#003087]'>“Here am I. Send me!” — Isaiah 6:8</p>
      </footer>
    </main>
  );
}
