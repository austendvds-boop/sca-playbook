"use client";
import { Play } from '@/lib/store';
import { PlaySVGRenderer } from '@/components/shared/PlaySVGRenderer';
import { EditableText } from '@/components/shared/EditableText';

export function DiagramSlot({ play, labelTop, labelBottom, onLabelTop, onLabelBottom, onRemove }: { play?: Play; labelTop: string; labelBottom: string; onLabelTop: (v: string) => void; onLabelBottom: (v: string) => void; onRemove: () => void }) {
  return <div className='relative rounded border p-2'><EditableText value={labelTop} onSave={onLabelTop} className='mb-1 text-xs font-semibold uppercase'/>{play ? <PlaySVGRenderer elements={play.canvasData} className='h-40 w-full'/> : <div className='flex h-40 items-center justify-center rounded border-2 border-dashed text-sm text-slate-500'>Drop play here</div>}<EditableText value={labelBottom} onSave={onLabelBottom} className='mt-1 text-xs text-slate-600'/><button className='absolute right-2 top-2 rounded bg-white/80 px-1 text-xs' onClick={onRemove}>X</button></div>;
}
