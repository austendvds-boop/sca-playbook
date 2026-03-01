"use client";
import { Play } from '@/lib/store';
import { PlaySVGRenderer } from '@/components/shared/PlaySVGRenderer';
import { EditableText } from '@/components/shared/EditableText';

export function DiagramSlot({
  play,
  labelTop,
  labelBottom,
  onLabelTop,
  onLabelBottom,
  onRemove,
  onAddPlay
}: {
  play?: Play;
  labelTop: string;
  labelBottom: string;
  onLabelTop: (v: string) => void;
  onLabelBottom: (v: string) => void;
  onRemove: () => void;
  onAddPlay?: () => void;
}) {
  return (
    <div className="relative rounded border-2 border-[#003087] p-3">
      <EditableText value={labelTop} onSave={onLabelTop} className="mb-2 text-xs font-extrabold uppercase text-[#003087]" />

      {play ? (
        <PlaySVGRenderer elements={play.canvasData} className="h-64 w-full" />
      ) : (
        <button
          type="button"
          onClick={onAddPlay}
          className="flex h-64 w-full items-center justify-center rounded border-2 border-dashed border-[#CC0000] bg-white px-4 text-lg font-black uppercase text-[#003087]"
        >
          + Add Play
        </button>
      )}

      <EditableText value={labelBottom} onSave={onLabelBottom} className="mt-2 text-xs font-bold uppercase text-[#003087]" />

      {play ? (
        <button className="absolute right-2 top-2 rounded border-2 border-[#003087] bg-white px-2 text-xs font-black text-[#003087]" onClick={onRemove}>
          ×
        </button>
      ) : null}
    </div>
  );
}

