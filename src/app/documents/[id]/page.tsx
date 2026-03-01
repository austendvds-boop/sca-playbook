"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DocumentRec, Play, PlayCardLayout, ReferenceLayout } from '@/lib/store';
import { PlayCardTemplate } from '@/components/templates/PlayCardTemplate';
import { ReferenceSheetTemplate } from '@/components/templates/ReferenceSheetTemplate';

export default function DocEdit({ params }: { params: { id: string } }) {
  const [doc, setDoc] = useState<DocumentRec | null>(null);
  const [plays, setPlays] = useState<Play[]>([]);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/documents/${params.id}`).then((r) => r.json()).then((d) => setDoc(d.data));
    fetch('/api/plays').then((r) => r.json()).then((d) => setPlays(d.data || []));
  }, [params.id]);

  useEffect(() => {
    if (!doc) return;
    const t = setTimeout(() => {
      fetch(`/api/documents/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      });
    }, 2000);
    return () => clearTimeout(t);
  }, [doc, params.id]);

  const playMap = useMemo(() => new Map(plays.map((p) => [p.id, p])), [plays]);

  const selectPlayForSlot = (playId: string) => {
    if (!doc || doc.docType !== 'play_card' || pickerIndex === null) return;
    const layout = doc.layoutData as PlayCardLayout;
    const diagrams = [...layout.diagrams];
    const current = diagrams[pickerIndex];
    if (!current) return;
    diagrams[pickerIndex] = { ...current, playId };
    setDoc({ ...doc, layoutData: { ...layout, diagrams } });
    setPickerIndex(null);
  };

  if (!doc) return <main className='p-6 text-[#003087] font-black uppercase'>Loading...</main>;

  return (
    <main className='mx-auto max-w-6xl space-y-3 p-4 md:p-6'>
      <div className='no-print flex gap-2'>
        <button
          className='rounded bg-[#003087] px-3 py-2 font-black uppercase text-white'
          onClick={() =>
            fetch(`/api/documents/${params.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(doc)
            })
          }
        >
          Save
        </button>
        <button className='rounded border-2 border-[#003087] px-3 py-2 font-black uppercase text-[#003087]' onClick={() => window.open(`/documents/${params.id}/print`, '_blank')}>
          Print
        </button>
      </div>

      {doc.docType === 'play_card' ? (
        <PlayCardTemplate
          layout={doc.layoutData as PlayCardLayout}
          playMap={playMap}
          onChange={(layoutData) => setDoc({ ...doc, layoutData })}
          onPickPlay={(index) => setPickerIndex(index)}
        />
      ) : (
        <ReferenceSheetTemplate layout={doc.layoutData as ReferenceLayout} playMap={playMap} onChange={(layoutData) => setDoc({ ...doc, layoutData })} />
      )}

      {pickerIndex !== null ? (
        <div className='no-print fixed inset-0 z-50 flex items-center justify-center bg-[#003087]/95 p-4'>
          <div className='max-h-[85vh] w-full max-w-5xl overflow-auto rounded border-4 border-[#CC0000] bg-white p-4'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-2xl font-black uppercase text-[#003087]'>Select Play</h2>
              <button type='button' onClick={() => setPickerIndex(null)} className='rounded border-2 border-[#003087] px-3 py-1 font-black uppercase text-[#003087]'>
                Close
              </button>
            </div>

            {plays.length === 0 ? (
              <div className='rounded border-2 border-[#003087] p-6 text-center'>
                <p className='font-black uppercase text-[#003087]'>No plays yet. Go to Whiteboard to draw some.</p>
                <Link href='/plays/new' className='mt-3 inline-block rounded bg-[#CC0000] px-4 py-2 font-black uppercase text-white'>
                  Open Whiteboard
                </Link>
              </div>
            ) : (
              <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {plays.map((p) => (
                  <button
                    key={p.id}
                    type='button'
                    onClick={() => selectPlayForSlot(p.id)}
                    className='rounded border-2 border-[#003087] p-3 text-left'
                  >
                    <div className='mb-2 text-sm font-black uppercase text-[#003087]'>{p.name}</div>
                    {p.thumbnailSvg ? (
                      <div className='h-32 w-full overflow-hidden border-2 border-[#CC0000]' dangerouslySetInnerHTML={{ __html: p.thumbnailSvg }} />
                    ) : (
                      <div className='flex h-32 items-center justify-center border-2 border-[#CC0000] text-xs font-black uppercase text-[#003087]'>
                        No Thumbnail
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}

