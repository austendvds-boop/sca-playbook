"use client";
import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DocumentRec, Play, ReferenceLayout } from '@/lib/store';
import { PlayCardTemplate } from '@/components/templates/PlayCardTemplate';
import { ReferenceSheetTemplate } from '@/components/templates/ReferenceSheetTemplate';
import { PlaySVGRenderer } from '@/components/shared/PlaySVGRenderer';
import { defaultPlayCardLayout, normalizePlayCardLayout } from '@/lib/installSheet';

export default function DocEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [doc, setDoc] = useState<DocumentRec | null>(null);
  const [plays, setPlays] = useState<Play[]>([]);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const fetched = d?.data as DocumentRec | null;
        if (!fetched) {
          setDoc(null);
          setLoading(false);
          return;
        }

        if (fetched.docType === 'play_card') {
          setDoc({ ...fetched, layoutData: normalizePlayCardLayout(fetched.layoutData) });
          setLoading(false);
          return;
        }

        setDoc(fetched);
        setLoading(false);
      });

    fetch('/api/plays')
      .then((r) => r.json())
      .then((d) => setPlays(d.data || []));
  }, [id]);

  useEffect(() => {
    if (!doc) return;
    const t = setTimeout(() => {
      fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      });
    }, 2000);
    return () => clearTimeout(t);
  }, [doc, id]);

  const playMap = useMemo(() => new Map(plays.map((p) => [p.id, p])), [plays]);

  const selectPlayForSlot = (playId: string) => {
    if (!doc || doc.docType !== 'play_card' || pickerIndex === null) return;
    const layout = normalizePlayCardLayout(doc.layoutData);
    const diagrams = [...layout.diagrams];
    const current = diagrams[pickerIndex];
    if (!current) return;
    diagrams[pickerIndex] = { ...current, playId };
    setDoc({ ...doc, layoutData: { ...layout, diagrams } });
    setPickerIndex(null);
  };

  if (loading) {
    return <main className='flex h-[100dvh] items-center justify-center overflow-hidden p-6 font-black uppercase text-[#003087]'>Loading...</main>;
  }

  if (!doc) {
    return <main className='flex h-[100dvh] items-center justify-center overflow-hidden p-6 font-black uppercase text-[#003087]'>Install Sheet not found.</main>;
  }

  return (
    <main className='h-[100dvh] overflow-hidden p-3 md:p-4'>
      <div className='mx-auto flex h-full max-w-6xl flex-col gap-3 overflow-hidden'>
        <div className='no-print flex shrink-0 items-center gap-2'>
          <Link href='/documents' className='rounded border border-[#003087] px-3 py-2 text-sm font-black uppercase text-[#003087]'>
            &lt; Install Sheets
          </Link>
          <button
            className='rounded bg-[#003087] px-3 py-2 font-black uppercase text-white'
            onClick={() =>
              fetch(`/api/documents/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(doc)
              })
            }
          >
            Save
          </button>
          <button className='rounded border-2 border-[#003087] px-3 py-2 font-black uppercase text-[#003087]' onClick={() => window.open(`/documents/${id}/print`, '_blank')}>
            Print
          </button>
        </div>

        <div className='min-h-0 flex-1 overflow-auto'>
          {doc.docType === 'play_card' ? (
            <PlayCardTemplate
              layout={normalizePlayCardLayout(doc.layoutData || defaultPlayCardLayout)}
              playMap={playMap}
              onChange={(layoutData) => setDoc({ ...doc, layoutData })}
              onPickPlay={(index) => setPickerIndex(index)}
            />
          ) : (
            <ReferenceSheetTemplate layout={doc.layoutData as ReferenceLayout} playMap={playMap} onChange={(layoutData) => setDoc({ ...doc, layoutData })} />
          )}
        </div>
      </div>

      {pickerIndex !== null ? (
        <div className='no-print fixed inset-0 z-50 bg-black/70 p-4'>
          <div className='mx-auto flex h-full w-full max-w-6xl flex-col rounded border-2 border-[#003087] bg-white p-4'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-2xl font-black uppercase text-[#003087]'>Select Play</h2>
              <button type='button' onClick={() => setPickerIndex(null)} className='h-11 w-11 rounded border-2 border-[#003087] text-2xl font-black text-[#003087]'>
                ×
              </button>
            </div>

            {plays.length === 0 ? (
              <div className='flex flex-1 flex-col items-center justify-center rounded border-2 border-[#003087] p-6 text-center'>
                <p className='font-black text-[#003087]'>No plays yet — go to Whiteboard to draw some</p>
                <Link href='/plays/new' className='mt-3 inline-block rounded bg-[#CC0000] px-4 py-3 font-black text-white'>
                  Open Whiteboard
                </Link>
              </div>
            ) : (
              <div className='grid flex-1 auto-rows-min gap-3 overflow-auto sm:grid-cols-2 lg:grid-cols-3'>
                {plays.map((p) => (
                  <button key={p.id} type='button' onClick={() => selectPlayForSlot(p.id)} className='rounded border-2 border-[#003087] p-3 text-left'>
                    <div className='mb-2 text-sm font-black text-[#003087]'>{p.name}</div>
                    <div className='h-32 w-full overflow-hidden border border-[#003087]'>
                      {Array.isArray(p.canvasData) && p.canvasData.length > 0 ? (
                        <PlaySVGRenderer elements={p.canvasData} className='h-full w-full' />
                      ) : p.thumbnailSvg?.trim().startsWith('<svg') ? (
                        <div className='h-full w-full' dangerouslySetInnerHTML={{ __html: p.thumbnailSvg }} />
                      ) : (
                        <div className='flex h-full items-center justify-center text-xs font-bold uppercase text-[#003087]/60'>No Thumbnail</div>
                      )}
                    </div>
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


