"use client";
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { FieldSVG } from '@/components/canvas/FieldSVG';
import { elementsAtom } from '@/atoms/canvas';

export default function NewPlay() {
  const [elements] = useAtom(elementsAtom);
  const router = useRouter();
  const save = async () => {
    const res = await fetch('/api/plays', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'New Play', canvasData: [...elements.values()], tags: ['general'] }) });
    const d = await res.json();
    router.push(`/plays/${d.data.id}`);
  };
  return <main><CanvasToolbar onSave={save} /><div className='p-4'><FieldSVG /></div></main>;
}
