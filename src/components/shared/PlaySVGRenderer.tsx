"use client";
import { CanvasElement, Point } from '@/lib/store';
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
  onBackgroundPointerDown?: (evt: React.PointerEvent<SVGSVGElement>) => void;
};

const pathData = (points: Point[]) => points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

export function PlaySVGRenderer({ elements, className, viewport = { x: 0, y: 0, zoom: 1 }, previewPath, selectedIds, touchActionNone, draggingPlayer, onCanvasClick, onCanvasPointerMove, onCanvasPointerUp, onCanvasDoubleClick, onPlayerPointerDown, onBackgroundPointerDown }: Props) {
  return (
    <svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" className={className} style={{ touchAction: touchActionNone ? 'none' : 'auto' }} onClick={onCanvasClick} onPointerMove={onCanvasPointerMove} onPointerUp={onCanvasPointerUp} onDoubleClick={onCanvasDoubleClick} onPointerDown={onBackgroundPointerDown}>
      <defs>
        <marker id="arrow-open" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#e2e8f0" /></marker>
        <marker id="arrow-filled" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#e2e8f0" /></marker>
      </defs>
      <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.zoom})`}>
        <FieldBackground />

        {elements.map((el) => {
          if (el.type === 'player') {
            const selected = selectedIds?.has(el.id);
            const upper = el.position.toUpperCase();
            const isCenter = upper === 'C' && el.side === 'offense';
            const lb = ['B', 'W', 'M', 'F', 'MIKE', 'WILL', 'SAM', 'LB'].some((s) => upper === s || upper.includes(s));
            const fill = el.side === 'offense' ? '#CC0000' : lb ? '#15803d' : '#003087';
            const renderX = draggingPlayer?.id === el.id ? draggingPlayer.x : el.x;
            const renderY = draggingPlayer?.id === el.id ? draggingPlayer.y : el.y;
            return (
              <g key={el.id} onPointerDown={(evt) => onPlayerPointerDown?.(el.id, evt, renderX, renderY)}>
                {!isCenter ? <circle cx={renderX} cy={renderY} r={14} fill={fill} stroke={selected ? '#f8fafc' : fill} strokeWidth={selected ? 2.5 : 1} /> : null}
                {isCenter ? <rect x={renderX - 14} y={renderY - 14} width={28} height={28} fill={fill} stroke={selected ? '#f8fafc' : fill} strokeWidth={selected ? 2.5 : 1} rx={4} /> : null}
                <text x={renderX} y={renderY + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#ffffff">{upper}</text>
              </g>
            );
          }
          if (el.type === 'text') return <text key={el.id} x={el.x} y={el.y} fontSize={el.fontSize ?? 16} fill={el.color ?? '#f1f5f9'}>{el.text}</text>;
          if (el.type === 'zone') return <polygon key={el.id} points={el.points.map((p) => `${p.x},${p.y}`).join(' ')} fill={el.color} opacity={el.opacity} />;
          const marker = el.type === 'block' ? 'url(#arrow-filled)' : 'url(#arrow-open)';
          return <path key={el.id} d={pathData(el.points)} fill="none" stroke={el.color ?? '#e2e8f0'} strokeWidth={3} strokeDasharray={el.type === 'motion' || el.lineType === 'dashed' ? '8 6' : undefined} markerEnd={marker} />;
        })}

        {previewPath && previewPath.length > 1 ? <path d={pathData(previewPath)} fill="none" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} /> : null}
      </g>
    </svg>
  );
}
