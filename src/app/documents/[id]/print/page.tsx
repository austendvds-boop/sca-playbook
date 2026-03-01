"use client";
import { useEffect, useMemo, useState } from 'react';
import { DocumentRec, Play, PlayCardLayout, ReferenceLayout } from '@/lib/store';
import { PlayCardTemplate } from '@/components/templates/PlayCardTemplate';
import { ReferenceSheetTemplate } from '@/components/templates/ReferenceSheetTemplate';

export default function PrintDoc({ params }: { params: { id: string } }) {
  const [doc, setDoc] = useState<DocumentRec | null>(null);
  const [plays, setPlays] = useState<Play[]>([]);
  useEffect(() => { fetch(`/api/documents/${params.id}`).then((r) => r.json()).then((d) => setDoc(d.data)); fetch('/api/plays').then((r) => r.json()).then((d) => setPlays(d.data || [])); setTimeout(() => window.print(), 400); }, [params.id]);
  const playMap = useMemo(() => new Map(plays.map((p) => [p.id, p])), [plays]);
  if (!doc) return null;
  return <main className='p-2'><div className='mb-2 flex items-center justify-between bg-[#CC0000] p-2 text-white'><div className='font-bold'>SCA Eagles</div><div className='text-sm'>Playbook Print</div></div>{doc.docType==='play_card' ? <PlayCardTemplate layout={doc.layoutData as PlayCardLayout} playMap={playMap} onChange={() => {}}/> : <ReferenceSheetTemplate layout={doc.layoutData as ReferenceLayout} playMap={playMap} onChange={() => {}}/>}<footer className="mt-8 pt-4 border-t border-gray-300 text-center"><p className="text-xs italic text-gray-400">"Then I heard the voice of the Lord saying, 'Whom shall I send? And who will go for us?' And I said, 'Here am I. Send me!'" - Isaiah 6:8</p></footer></main>;
}