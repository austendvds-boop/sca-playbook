"use client";

import Image from 'next/image';
import { use, useEffect, useMemo, useState } from 'react';
import { DocumentRec, Play, ReferenceLayout } from '@/lib/store';
import { PlaySVGRenderer } from '@/components/shared/PlaySVGRenderer';
import { normalizePlayCardLayout } from '@/lib/installSheet';

function normalizeReferenceLayout(input: unknown): ReferenceLayout {
  const raw = (input ?? {}) as Partial<ReferenceLayout>;
  const rows =
    Array.isArray(raw.rows) && raw.rows.length > 0
      ? raw.rows.map((row, rowIndex) => ({
          id: row?.id ?? `row-${rowIndex + 1}`,
          combination: row?.combination ?? '',
          description: row?.description ?? '',
          diagrams:
            Array.isArray(row?.diagrams) && row.diagrams.length > 0
              ? row.diagrams.map((diagram, diagramIndex) => ({
                  key: diagram?.key ?? `row-${rowIndex + 1}-diagram-${diagramIndex + 1}`,
                  playId: diagram?.playId ?? null,
                  labelTop: diagram?.labelTop ?? '',
                  labelBottom: diagram?.labelBottom ?? ''
                }))
              : [{ key: `row-${rowIndex + 1}-diagram-1`, playId: null, labelTop: '', labelBottom: '' }]
        }))
      : [];

  return {
    title: raw.title?.trim() || 'REFERENCE SHEET',
    rows
  };
}

export default function PrintDoc({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [doc, setDoc] = useState<DocumentRec | null>(null);
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setLoadError('');

        const [docRes, playsRes] = await Promise.all([fetch(`/api/documents/${id}`), fetch('/api/plays')]);
        if (!docRes.ok || !playsRes.ok) throw new Error('Failed to load print data');

        const [docPayload, playsPayload] = await Promise.all([docRes.json(), playsRes.json()]);
        if (cancelled) return;

        setDoc((docPayload?.data ?? null) as DocumentRec | null);
        setPlays(Array.isArray(playsPayload?.data) ? playsPayload.data : []);
      } catch (error) {
        console.error('Failed to load printable document', error);
        if (!cancelled) {
          setDoc(null);
          setPlays([]);
          setLoadError('Unable to prepare this document right now.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const playMap = useMemo(() => new Map(plays.map((p) => [p.id, p])), [plays]);

  if (loading) {
    return (
      <main className='print-loading p-5 text-[#003087]'>
        <style jsx global>{`
          @media print {
            .print-loading { display: none !important; }
          }
        `}</style>
        Preparing document...
      </main>
    );
  }

  if (!doc) return <main className='p-5 text-[#003087]'>{loadError || 'Document not found.'}</main>;

  return (
    <main className='p-5 text-[#003087]'>
      <style jsx global>{`
        @media print {
          @page { size: letter portrait; margin: 0.5in; }
          html, body { margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .print-loading { display: none !important; }
          [contenteditable='true'] { outline: none !important; }
        }
      `}</style>

      <div className='no-print mb-3 flex justify-end'>
        <button onClick={() => window.print()} className='rounded border border-[#003087] px-3 py-1.5 text-sm font-semibold text-[#003087] hover:bg-[#003087]/5'>
          Print
        </button>
      </div>

      {doc.docType === 'play_card' ? (
        <PlayCardPrint doc={doc} playMap={playMap} />
      ) : doc.docType === 'reference_sheet' ? (
        <ReferenceSheetPrint doc={doc} playMap={playMap} />
      ) : (
        <div className='p-5 text-[#003087]'>Unsupported document.</div>
      )}
    </main>
  );
}

function PlayCardPrint({ doc, playMap }: { doc: DocumentRec; playMap: Map<string, Play> }) {
  const layout = normalizePlayCardLayout(doc.layoutData);
  const diagrams = layout.diagrams.slice(0, 2);

  return (
    <>
      <header className='mb-3 flex items-center justify-between bg-[#003087] px-4 py-3 text-white'>
        <Image src='/sca-logo.png' alt='SCA Eagles' width={48} height={48} className='h-12 w-12 object-contain' />
        <div className='text-right text-sm font-black uppercase tracking-wide'>SCA Eagles Football - Install Sheet</div>
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
        <p className='text-xs italic text-[#003087]'>"Here am I. Send me!" - Isaiah 6:8</p>
      </footer>
    </>
  );
}

function ReferenceSheetPrint({ doc, playMap }: { doc: DocumentRec; playMap: Map<string, Play> }) {
  const layout = normalizeReferenceLayout(doc.layoutData);

  return (
    <div className='mx-auto max-w-[8in] bg-white font-serif text-slate-900'>
      <header className='border-b border-slate-300 pb-4'>
        <div className='text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>SCA Eagles Football</div>
        <h1 className='mt-2 text-3xl font-semibold tracking-[0.04em]'>{layout.title || 'Reference Sheet'}</h1>
        <p className='mt-2 text-sm leading-6 text-slate-600'>Quick reference for combinations, descriptions, and attached diagrams.</p>
      </header>

      <section className='mt-6 overflow-hidden rounded border border-slate-300'>
        <div className='grid grid-cols-[1.1fr_1.6fr_2.3fr] border-b border-slate-300 bg-slate-100 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600'>
          <div>Combination</div>
          <div>Description</div>
          <div>Diagram</div>
        </div>

        {layout.rows.length === 0 ? (
          <div className='px-4 py-8 text-sm text-slate-500'>No reference rows added.</div>
        ) : (
          layout.rows.map((row, rowIndex) => (
            <div key={row.id} className={`grid grid-cols-[1.1fr_1.6fr_2.3fr] gap-4 border-b border-slate-200 px-4 py-4 last:border-b-0 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
              <div className='text-sm font-semibold leading-6 text-slate-900'>{row.combination || ' '}</div>
              <div className='text-sm leading-6 text-slate-700'>{row.description || ' '}</div>
              <div className='space-y-3'>
                {row.diagrams.map((diagram) => {
                  const play = diagram.playId ? playMap.get(diagram.playId) : undefined;

                  return (
                    <div key={diagram.key} className='rounded border border-slate-300 bg-white p-2'>
                      {diagram.labelTop ? <div className='mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500'>{diagram.labelTop}</div> : null}
                      <div className='h-40 overflow-hidden rounded border border-slate-200 bg-slate-50'>
                        {play ? (
                          <PlaySVGRenderer elements={play.canvasData} className='h-full w-full' />
                        ) : (
                          <div className='flex h-full items-center justify-center text-sm text-slate-500'>No diagram attached</div>
                        )}
                      </div>
                      {diagram.labelBottom ? <div className='mt-2 text-xs text-slate-600'>{diagram.labelBottom}</div> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
