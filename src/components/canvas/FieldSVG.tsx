"use client";
import { useAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { activeToolAtom, elementsAtom, selectedIdsAtom, undoStackAtom, redoStackAtom, viewportAtom, Tool } from '@/atoms/canvas';
import { CanvasElement, LineElement, Point } from '@/lib/store';
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

function isLineTool(tool: Tool): tool is 'route' | 'dashed_route' | 'zigzag' | 'tbar' {
  return tool === 'route' || tool === 'dashed_route' || tool === 'zigzag' || tool === 'tbar';
}

function simplifyPoints(points: Point[]): Point[] {
  if (points.length <= 3) return points;
  const out: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i += 3) out.push(points[i]);
  out.push(points[points.length - 1]);
  return out;
}

function lineElementFromTool(tool: 'route' | 'dashed_route' | 'zigzag' | 'tbar', points: Point[]): LineElement {
  if (tool === 'dashed_route') {
    return { id: uuid(), type: 'motion', lineStyle: 'dashed_route', points, color: '#111' };
  }
  if (tool === 'zigzag') {
    return { id: uuid(), type: 'block', lineStyle: 'zigzag', points, color: '#111' };
  }
  if (tool === 'tbar') {
    return { id: uuid(), type: 'block', lineStyle: 'tbar', points, color: '#111' };
  }
  return { id: uuid(), type: 'route', lineStyle: 'route', points, color: '#111' };
}

export function FieldSVG() {
  const [tool, setTool] = useAtom(activeToolAtom);
  const [elements, setElements] = useAtom(elementsAtom);
  const [selected, setSelected] = useAtom(selectedIdsAtom);
  const [undo, setUndo] = useAtom(undoStackAtom);
  const [, setRedo] = useAtom(redoStackAtom);
  const [viewport, setViewport] = useAtom(viewportAtom);
  const zoneStartRef = useRef<Point | null>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const freehandRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);
  const [preview, setPreview] = useState<Point[]>([]);
  const [zonePreview, setZonePreview] = useState<{ cx: number; cy: number; rx: number; ry: number } | null>(null);
  const [draggingPlayer, setDraggingPlayer] = useState<{ id: string; x: number; y: number } | null>(null);

  const elementArr = useMemo(() => [...elements.values()], [elements]);
  const pushUndo = () => setUndo([...undo, elementArr]);

  const commit = (next: Map<string, CanvasElement>) => {
    pushUndo();
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
    const line = lineElementFromTool(tool, simplified);
    next.set(line.id, line);
    commit(next);
    setSelected(new Set([line.id]));
  };

  useEffect(() => {
    const onKey = (evt: KeyboardEvent) => {
      const key = evt.key.toLowerCase();
      if (key === 'v') setTool('select');
      if (key === 'a') setTool('route');
      if (key === 'b') setTool('zigzag');
      if (key === 'm') setTool('dashed_route');
      if (key === 't') setTool('text');
      if (key === 'z') setTool('zone');
      if (evt.key === 'Delete' && selected.size > 0) {
        const next = new Map(elements);
        selected.forEach((id) => next.delete(id));
        commit(next);
        setSelected(new Set());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setTool, elements, selected, setSelected]);

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
    }
  };

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
    if (tool === 'zone' && zoneStartRef.current) {
      const rx = Math.abs(p.x - zoneStartRef.current.x);
      const ry = Math.abs(p.y - zoneStartRef.current.y);
      setZonePreview({
        cx: zoneStartRef.current.x,
        cy: zoneStartRef.current.y,
        rx: Math.max(rx, 10),
        ry: Math.max(ry, 10)
      });
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
    if (tool === 'zone') {
      if (zoneStartRef.current && zonePreview) {
        const el: CanvasElement = {
          id: uuid(),
          type: 'zone',
          cx: zonePreview.cx,
          cy: zonePreview.cy,
          rx: zonePreview.rx,
          ry: zonePreview.ry,
          color: '#3b82f6',
          opacity: 0.3
        };
        commit(new Map(elements).set(el.id, el));
        setSelected(new Set([el.id]));
      }
      zoneStartRef.current = null;
      setZonePreview(null);
      return;
    }

    if (isDrawingRef.current) {
      const last = freehandRef.current[freehandRef.current.length - 1];
      const dx = p.x - last.x;
      const dy = p.y - last.y;
      if (Math.sqrt(dx * dx + dy * dy) > 1) {
        freehandRef.current = [...freehandRef.current, p];
      }
      commitFreehand(freehandRef.current);
      isDrawingRef.current = false;
      freehandRef.current = [];
      setPreview([]);
    }
  };

  const onDoubleClick = () => {};

  return (
    <div className="relative h-full w-full overflow-hidden rounded-none bg-gray-100">
      <PlaySVGRenderer
        elements={elementArr}
        className="h-full w-full"
        viewport={viewport}
        previewPath={preview}
        zonePreview={zonePreview}
        draggingPlayer={draggingPlayer ?? undefined}
        touchActionNone
        onCanvasClick={onCanvasClick}
        onCanvasPointerMove={onPointerMove}
        onCanvasPointerUp={onPointerUp}
        onCanvasDoubleClick={onDoubleClick}
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
          if (tool === 'select') {
            setSelected(new Set([id]));
          }
        }}
        onBackgroundPointerDown={(evt) => {
          if (evt.pointerType === 'touch' && evt.isPrimary === false) {
            setViewport({ ...viewport, x: viewport.x + 3, y: viewport.y + 3 });
          }
          if (isLineTool(tool)) {
            startFreehand(evt, svgPoint(evt));
            return;
          }
          if (tool === 'zone') {
            zoneStartRef.current = svgPoint(evt);
            setZonePreview({ cx: zoneStartRef.current.x, cy: zoneStartRef.current.y, rx: 10, ry: 10 });
            return;
          }
          if (tool === 'select') setSelected(new Set());
        }}
      />
    </div>
  );
}