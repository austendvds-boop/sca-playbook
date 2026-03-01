"use client";
import { useAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { activeToolAtom, elementsAtom, selectedIdsAtom, undoStackAtom, redoStackAtom, viewportAtom, Tool } from '@/atoms/canvas';
import { CanvasElement, LineElement, Point, ZoneElement } from '@/lib/store';
import { PlaySVGRenderer } from '@/components/shared/PlaySVGRenderer';

const FIELD_WIDTH = 1000;
const FIELD_HEIGHT = 560;

function pointFromClient(clientX: number, clientY: number, svg: SVGSVGElement): Point {
  const r = svg.getBoundingClientRect();
  return { x: ((clientX - r.left) / r.width) * FIELD_WIDTH, y: ((clientY - r.top) / r.height) * FIELD_HEIGHT };
}

function svgPoint(evt: React.PointerEvent<SVGSVGElement>): Point {
  return pointFromClient(evt.clientX, evt.clientY, evt.currentTarget);
}

function isLineTool(tool: Tool): tool is 'route' | 'dashed_route' | 'tbar' | 'zone' {
  return tool === 'route' || tool === 'dashed_route' || tool === 'tbar' || tool === 'zone';
}

function simplifyPoints(points: Point[]): Point[] {
  if (points.length <= 3) return points;
  const out: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i += 3) out.push(points[i]);
  out.push(points[points.length - 1]);
  return out;
}

function lineElementFromTool(tool: 'route' | 'dashed_route' | 'tbar', points: Point[]): LineElement {
  if (tool === 'dashed_route') return { id: uuid(), type: 'motion', lineStyle: 'dashed_route', points, color: '#111' };
  if (tool === 'tbar') return { id: uuid(), type: 'block', lineStyle: 'tbar', points, color: '#111' };
  return { id: uuid(), type: 'route', lineStyle: 'route', points, color: '#111' };
}

export function FieldSVG() {
  const [tool, setTool] = useAtom(activeToolAtom);
  const [elements, setElements] = useAtom(elementsAtom);
  const [selected, setSelected] = useAtom(selectedIdsAtom);
  const [, setUndo] = useAtom(undoStackAtom);
  const [, setRedo] = useAtom(redoStackAtom);
  const [viewport, setViewport] = useAtom(viewportAtom);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const freehandRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);
  const [preview, setPreview] = useState<Point[]>([]);
  const [draggingPlayer, setDraggingPlayer] = useState<{ id: string; x: number; y: number } | null>(null);

  const elementArr = useMemo(() => [...elements.values()], [elements]);

  const commit = (next: Map<string, CanvasElement>) => {
    setUndo((prev) => [...prev, [...elements.values()]]);
    setRedo([]);
    setElements(next);
  };

  const startFreehand = (evt: React.PointerEvent<SVGSVGElement> | React.PointerEvent<SVGElement>, startPoint: Point) => {
    const svg = evt.currentTarget instanceof SVGSVGElement ? evt.currentTarget : evt.currentTarget.ownerSVGElement;
    if (!svg) return;
    svg.setPointerCapture(evt.pointerId);
    isDrawingRef.current = true;
    freehandRef.current = [startPoint];
    setPreview([startPoint]);
  };

  const commitFreehand = (points: Point[]) => {
    if (!isLineTool(tool)) return;
    const simplified = simplifyPoints(points);
    if (simplified.length < 2) return;
    const next = new Map(elements);

    if (tool === 'zone') {
      const lastPt = simplified[simplified.length - 1];
      const lineEl: LineElement = { id: uuid(), type: 'route', lineStyle: 'route', points: simplified, color: '#111', noArrow: true };
      next.set(lineEl.id, lineEl);
      const zoneEl: ZoneElement = { id: uuid(), type: 'zone', cx: lastPt.x, cy: lastPt.y, rx: 28, ry: 20, color: '#f59e0b', opacity: 0.45 };
      next.set(zoneEl.id, zoneEl);
      commit(next);
      setSelected(new Set([zoneEl.id]));
    } else {
      const line = lineElementFromTool(tool as 'route' | 'dashed_route' | 'tbar', simplified);
      next.set(line.id, line);
      commit(next);
      setSelected(new Set([line.id]));
    }
  };

  useEffect(() => {
    const onKey = (evt: KeyboardEvent) => {
      const target = evt.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (target?.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select') return;

      const key = evt.key.toLowerCase();
      const mod = evt.metaKey || evt.ctrlKey;

      if (mod && key === 'z') {
        evt.preventDefault();
        if (evt.shiftKey) {
          window.dispatchEvent(new CustomEvent('canvas-redo'));
        } else {
          window.dispatchEvent(new CustomEvent('canvas-undo'));
        }
        return;
      }

      if (key === 'r') setTool('route');
      if (key === 'm') setTool('dashed_route');
      if (key === 'b') setTool('tbar');
      if (key === 'z') setTool('zone');
      if (key === 's' || evt.key === 'Escape') setTool('select');

      if ((evt.key === 'Delete' || evt.key === 'Backspace') && selected.size > 0) {
        evt.preventDefault();
        const next = new Map(elements);
        selected.forEach((id) => next.delete(id));
        commit(next);
        setSelected(new Set());
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setTool, elements, selected, setSelected]);

  const onPointerMove = (evt: React.PointerEvent<SVGSVGElement>) => {
    const p = svgPoint(evt);
    if (dragRef.current) {
      setDraggingPlayer({ id: dragRef.current.id, x: p.x - dragRef.current.dx, y: p.y - dragRef.current.dy });
      return;
    }
    if (isDrawingRef.current) {
      const last = freehandRef.current[freehandRef.current.length - 1];
      const dx = p.x - last.x;
      const dy = p.y - last.y;
      if (Math.sqrt(dx * dx + dy * dy) > 4) {
        freehandRef.current = [...freehandRef.current, p];
        setPreview([...freehandRef.current]);
      }
      return;
    }
  };

  const onPointerUp = (evt: React.PointerEvent<SVGSVGElement>) => {
    const p = svgPoint(evt);
    if (dragRef.current && draggingPlayer) {
      const hit = elements.get(dragRef.current.id);
      if (hit?.type === 'player') {
        const next = new Map(elements);
        next.set(hit.id, { ...hit, x: draggingPlayer.x, y: draggingPlayer.y });
        commit(next);
      }
      dragRef.current = null;
      setDraggingPlayer(null);
      return;
    }

    if (isDrawingRef.current) {
      const last = freehandRef.current[freehandRef.current.length - 1];
      const dx = p.x - last.x;
      const dy = p.y - last.y;
      if (Math.sqrt(dx * dx + dy * dy) > 1) freehandRef.current = [...freehandRef.current, p];
      commitFreehand(freehandRef.current);
      isDrawingRef.current = false;
      freehandRef.current = [];
      setPreview([]);
    }
  };

  const cursorClass = tool === 'select' ? 'cursor-default' : tool === 'route' || tool === 'dashed_route' || tool === 'tbar' || tool === 'zone' ? 'cursor-crosshair' : 'cursor-not-allowed';

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-none bg-gray-100 ${cursorClass}`}>
      <PlaySVGRenderer
        elements={elementArr}
        className="h-full w-full"
        viewport={viewport}
        previewPath={preview}
        draggingPlayer={draggingPlayer ?? undefined}
        touchActionNone
        onCanvasPointerMove={onPointerMove}
        onCanvasPointerUp={onPointerUp}
        onPlayerPointerDown={(id, evt, x, y) => {
          evt.stopPropagation();
          if (isLineTool(tool)) {
            startFreehand(evt, { x, y });
            return;
          }
          if (tool === 'select') {
            const svg = evt.currentTarget.ownerSVGElement;
            if (!svg) return;
            svg.setPointerCapture(evt.pointerId);
            const pt = pointFromClient(evt.clientX, evt.clientY, svg);
            dragRef.current = { id, dx: pt.x - x, dy: pt.y - y };
            setSelected(new Set([id]));
          }
        }}
        selectedIds={selected}
        onLinePointerDown={(id, evt) => {
          evt.stopPropagation();
          if (tool === 'select') setSelected(new Set([id]));
        }}
        onBackgroundPointerDown={(evt) => {
          if (evt.pointerType === 'touch' && evt.isPrimary === false) setViewport({ ...viewport, x: viewport.x + 3, y: viewport.y + 3 });
          if (isLineTool(tool)) {
            startFreehand(evt, svgPoint(evt));
            return;
          }
          if (tool === 'select') setSelected(new Set());
        }}
      />
    </div>
  );
}
