"use client";
import { useAtom } from 'jotai';
import { useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { activeToolAtom, elementsAtom, selectedIdsAtom, undoStackAtom, redoStackAtom, viewportAtom } from '@/atoms/canvas';
import { CanvasElement, Point } from '@/lib/store';
import { PlaySVGRenderer } from '@/components/shared/PlaySVGRenderer';

function pointFromClient(clientX: number, clientY: number, svg: SVGSVGElement): Point {
  const r = svg.getBoundingClientRect();
  return { x: ((clientX - r.left) / r.width) * 800, y: ((clientY - r.top) / r.height) * 600 };
}

function svgPoint(evt: React.PointerEvent<SVGSVGElement>): Point {
  return pointFromClient(evt.clientX, evt.clientY, evt.currentTarget);
}

export function FieldSVG() {
  const [tool] = useAtom(activeToolAtom);
  const [elements, setElements] = useAtom(elementsAtom);
  const [selected, setSelected] = useAtom(selectedIdsAtom);
  const [undo, setUndo] = useAtom(undoStackAtom);
  const [, setRedo] = useAtom(redoStackAtom);
  const [viewport, setViewport] = useAtom(viewportAtom);
  const draftRef = useRef<Point[]>([]);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const [preview, setPreview] = useState<Point[]>([]);

  const elementArr = useMemo(() => [...elements.values()], [elements]);
  const pushUndo = () => setUndo([...undo, elementArr]);

  const commit = (next: Map<string, CanvasElement>) => {
    pushUndo();
    setRedo([]);
    setElements(next);
  };

  const onCanvasClick = (evt: React.PointerEvent<SVGSVGElement>) => {
    const p = svgPoint(evt);
    if (tool === 'player') {
      const el: CanvasElement = { id: uuid(), type: 'player', x: p.x, y: p.y, position: 'X', side: 'offense' };
      commit(new Map(elements).set(el.id, el));
      setSelected(new Set([el.id]));
    } else if (tool === 'text') {
      const text = window.prompt('Label text', 'Label') ?? 'Label';
      const el: CanvasElement = { id: uuid(), type: 'text', x: p.x, y: p.y, text };
      commit(new Map(elements).set(el.id, el));
      setSelected(new Set([el.id]));
    } else if (tool === 'zone') {
      draftRef.current = [...draftRef.current, p];
      if (draftRef.current.length >= 3 && evt.detail >= 2) {
        const el: CanvasElement = { id: uuid(), type: 'zone', points: [...draftRef.current], color: '#60a5fa', opacity: 0.22 };
        commit(new Map(elements).set(el.id, el));
        draftRef.current = [];
        setPreview([]);
      }
    }
  };

  const onPointerMove = (evt: React.PointerEvent<SVGSVGElement>) => {
    const p = svgPoint(evt);
    if (dragRef.current) {
      const hit = elements.get(dragRef.current.id);
      if (hit?.type === 'player') {
        setPreview([{ x: p.x - dragRef.current.dx, y: p.y - dragRef.current.dy }]);
      }
      return;
    }
    if (tool === 'route' || tool === 'block' || tool === 'motion' || tool === 'zone') {
      if (draftRef.current.length > 0) setPreview([...draftRef.current, p]);
    }
  };

  const onPointerUp = (evt: React.PointerEvent<SVGSVGElement>) => {
    const p = svgPoint(evt);
    if (dragRef.current) {
      const id = dragRef.current.id;
      const hit = elements.get(id);
      if (hit?.type === 'player' && preview[0]) {
        const next = new Map(elements);
        next.set(id, { ...hit, x: preview[0].x, y: preview[0].y });
        commit(next);
      }
      dragRef.current = null;
      setPreview([]);
      return;
    }
    if (tool === 'route' || tool === 'block' || tool === 'motion') {
      draftRef.current = [...draftRef.current, p];
    }
  };

  const onDoubleClick = () => {
    if ((tool === 'route' || tool === 'block' || tool === 'motion') && draftRef.current.length > 1) {
      const el: CanvasElement = { id: uuid(), type: tool, points: [...draftRef.current], color: '#111827', lineType: tool === 'motion' ? 'dashed' : 'solid' };
      commit(new Map(elements).set(el.id, el));
      draftRef.current = [];
      setPreview([]);
    }
  };

  return (
    <div className="h-[74vh] rounded border bg-white">
      <PlaySVGRenderer
        elements={elementArr}
        className="h-full w-full"
        viewport={viewport}
        previewPath={preview}
        touchActionNone
        onCanvasClick={onCanvasClick}
        onCanvasPointerMove={onPointerMove}
        onCanvasPointerUp={onPointerUp}
        onCanvasDoubleClick={onDoubleClick}
        onPlayerPointerDown={(id, evt, x, y) => {
          evt.stopPropagation();
          if (tool === 'select') {
            const svg = evt.currentTarget.ownerSVGElement;
            if (!svg) return;
            const pt = pointFromClient(evt.clientX, evt.clientY, svg);
            dragRef.current = { id, dx: pt.x - x, dy: pt.y - y };
            setSelected(new Set([id]));
          }
        }}
        selectedIds={selected}
        onBackgroundPointerDown={(evt) => {
          if (evt.pointerType === 'touch' && evt.isPrimary === false) {
            setViewport({ ...viewport, x: viewport.x + 3, y: viewport.y + 3 });
          }
          if (tool === 'select') setSelected(new Set());
        }}
      />
    </div>
  );
}
