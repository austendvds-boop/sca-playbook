"use client";
import { CanvasElement, LineElement, Point } from '@/lib/store';
import { FieldBackground } from '@/components/canvas/FieldBackground';

type Props = {
  elements: CanvasElement[];
  className?: string;
  viewport?: { x: number; y: number; zoom: number };
  previewPath?: Point[];
  selectedIds?: Set<string>;
  touchActionNone?: boolean;
  draggingPlayer?: { id: string; x: number; y: number };
  onCanvasClick?: (evt: React.PointerEvent<SVGSVGElement>) => void;
  onCanvasPointerMove?: (evt: React.PointerEvent<SVGSVGElement>) => void;
  onCanvasPointerUp?: (evt: React.PointerEvent<SVGSVGElement>) => void;
  onCanvasDoubleClick?: (evt: React.MouseEvent<SVGSVGElement>) => void;
  onPlayerPointerDown?: (id: string, evt: React.PointerEvent<SVGElement>, x: number, y: number) => void;
  onLinePointerDown?: (id: string, evt: React.PointerEvent<SVGElement>) => void;
  onBackgroundPointerDown?: (evt: React.PointerEvent<SVGSVGElement>) => void;
  viewBox?: string;
};

function smoothPath(points: Point[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const cp2x = (points[i].x + points[i + 1].x) / 2;
    const cp2y = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x} ${points[i].y} ${cp2x} ${cp2y}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

function zigzagPath(points: Point[]): string {
  if (points.length < 2) return '';
  const start = points[0];
  const end = points[points.length - 1];
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return '';

  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const period = 12;
  const amp = 7;
  const steps = Math.max(4, Math.floor(len / period));

  let d = `M ${start.x} ${start.y}`;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const cx = start.x + dx * t;
    const cy = start.y + dy * t;
    const side = i % 2 === 0 ? 1 : -1;
    d += ` L ${cx + px * amp * side} ${cy + py * amp * side}`;
  }
  d += ` L ${end.x} ${end.y}`;
  return d;
}

function resolveLineStyle(el: LineElement): 'route' | 'dashed_route' | 'zigzag' | 'tbar' {
  if (el.lineStyle) return el.lineStyle;
  if (el.type === 'motion') return 'dashed_route';
  return 'route';
}

function tBarData(points: Point[]): { x1: number; y1: number; x2: number; y2: number } | null {
  if (points.length < 2) return null;
  const last = points[points.length - 1];
  const prev = points[points.length - 2] ?? points[0];
  const dx = last.x - prev.x;
  const dy = last.y - prev.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const barLen = 12;

  return {
    x1: last.x - px * barLen,
    y1: last.y - py * barLen,
    x2: last.x + px * barLen,
    y2: last.y + py * barLen
  };
}

export function PlaySVGRenderer({ elements, className, viewport = { x: 0, y: 0, zoom: 1 }, previewPath, selectedIds, touchActionNone, draggingPlayer, onCanvasClick, onCanvasPointerMove, onCanvasPointerUp, onCanvasDoubleClick, onPlayerPointerDown, onLinePointerDown, onBackgroundPointerDown, viewBox = '0 0 1000 560' }: Props) {
  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" width="100%" height="100%" className={className} style={{ touchAction: touchActionNone ? 'none' : 'auto' }} onClick={onCanvasClick} onPointerMove={onCanvasPointerMove} onPointerUp={onCanvasPointerUp} onDoubleClick={onCanvasDoubleClick} onPointerDown={onBackgroundPointerDown}>
      <defs>
        {/* Small open arrowhead - thin V tip */}
        <marker
          id="arrow-open"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="2"
          markerHeight="2"
          orient="auto-start-reverse"
        >
          <path d="M 2 2 L 8 5 L 2 8" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </marker>

        {/* Small filled arrowhead - for block lines */}
        <marker
          id="arrow-filled"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="2"
          markerHeight="2"
          orient="auto-start-reverse"
        >
          <path d="M 2 2 L 8 5 L 2 8 Z" fill="#111111" />
        </marker>
      </defs>
      <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.zoom})`}>
        <FieldBackground />

        {elements.map((el) => {
          if (el.type === 'player') {
            const selected = selectedIds?.has(el.id);
            const upper = el.position.toUpperCase();
            const isOL = ['LT', 'LG', 'C', 'RG', 'RT'].includes(upper);
            const lb = ['B', 'W', 'M', 'F', 'MIKE', 'WILL', 'SAM', 'LB'].some((s) => upper === s || upper.includes(s));
            const fill = el.side === 'offense' ? '#CC0000' : lb ? '#15803d' : '#003087';
            const renderX = draggingPlayer?.id === el.id ? draggingPlayer.x : el.x;
            const renderY = draggingPlayer?.id === el.id ? draggingPlayer.y : el.y;
            return (
              <g key={el.id} onPointerDown={(evt) => onPlayerPointerDown?.(el.id, evt, renderX, renderY)}>
                {selected ? <circle cx={renderX} cy={renderY} r={18} fill="none" stroke="rgba(248,250,252,0.45)" strokeWidth={4} /> : null}
                {!isOL ? <circle cx={renderX} cy={renderY} r={14} fill={fill} stroke={selected ? '#f8fafc' : fill} strokeWidth={selected ? 3 : 1} /> : null}
                {isOL ? <rect x={renderX - 10} y={renderY - 10} width={20} height={20} fill={fill} stroke={selected ? '#f8fafc' : fill} strokeWidth={selected ? 3 : 1} rx={2} /> : null}
                <text x={renderX} y={renderY + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#ffffff">{upper}</text>
              </g>
            );
          }
          if (el.type === 'text') return <text key={el.id} x={el.x} y={el.y} fontSize={el.fontSize ?? 16} fill={el.color ?? '#f1f5f9'}>{el.text}</text>;
          if (el.type === 'zone') {
            return (
              <ellipse
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                rx={el.rx}
                ry={el.ry}
                fill={el.color}
                opacity={el.opacity}
                stroke={selectedIds?.has(el.id) ? '#f59e0b' : 'none'}
                strokeWidth={2}
                onPointerDown={(evt) => onLinePointerDown?.(el.id, evt)}
              />
            );
          }

          const lineStyle = resolveLineStyle(el);
          const d = lineStyle === 'zigzag' ? zigzagPath(el.points) : smoothPath(el.points);
          const tbar = lineStyle === 'tbar' ? tBarData(el.points) : null;
          const isSelected = selectedIds?.has(el.id);
          const stroke = isSelected ? '#f59e0b' : '#111';
          const markerEnd = lineStyle === 'tbar' || el.noArrow ? undefined : 'url(#arrow-open)';
          return (
            <g key={el.id} onPointerDown={(evt) => onLinePointerDown?.(el.id, evt)}>
              <path d={d} fill="none" stroke="transparent" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" markerEnd={markerEnd} />
              <path d={d} fill="none" stroke={stroke} strokeWidth={2.5} strokeDasharray={lineStyle === 'dashed_route' ? '8 5' : undefined} markerEnd={markerEnd} strokeLinecap="round" strokeLinejoin="round" />
              {tbar ? (<><line x1={tbar.x1} y1={tbar.y1} x2={tbar.x2} y2={tbar.y2} stroke="transparent" strokeWidth={16} /><line x1={tbar.x1} y1={tbar.y1} x2={tbar.x2} y2={tbar.y2} stroke={stroke} strokeWidth={2.5} /></>) : null}
            </g>
          );
        })}

        {previewPath && previewPath.length > 1 ? <path d={smoothPath(previewPath)} fill="none" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} /> : null}      </g>
    </svg>
  );
}






