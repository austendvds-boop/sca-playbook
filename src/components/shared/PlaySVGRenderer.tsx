"use client";
import { CanvasElement, Point } from '@/lib/store';

type Props = {
  elements: CanvasElement[];
  className?: string;
  viewport?: { x: number; y: number; zoom: number };
  previewPath?: Point[];
  selectedIds?: Set<string>;
  touchActionNone?: boolean;
  onCanvasClick?: (evt: React.PointerEvent<SVGSVGElement>) => void;
  onCanvasPointerMove?: (evt: React.PointerEvent<SVGSVGElement>) => void;
  onCanvasPointerUp?: (evt: React.PointerEvent<SVGSVGElement>) => void;
  onCanvasDoubleClick?: (evt: React.MouseEvent<SVGSVGElement>) => void;
  onPlayerPointerDown?: (id: string, evt: React.PointerEvent<SVGElement>, x: number, y: number) => void;
  onBackgroundPointerDown?: (evt: React.PointerEvent<SVGSVGElement>) => void;
};

const pathData = (points: Point[]) => points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

export function PlaySVGRenderer({ elements, className, viewport = { x: 0, y: 0, zoom: 1 }, previewPath, selectedIds, touchActionNone, onCanvasClick, onCanvasPointerMove, onCanvasPointerUp, onCanvasDoubleClick, onPlayerPointerDown, onBackgroundPointerDown }: Props) {
  return (
    <svg viewBox="0 0 800 600" className={className} style={{ touchAction: touchActionNone ? 'none' : 'auto' }} onClick={onCanvasClick} onPointerMove={onCanvasPointerMove} onPointerUp={onCanvasPointerUp} onDoubleClick={onCanvasDoubleClick} onPointerDown={onBackgroundPointerDown}>
      <defs>
        <marker id="arrow-open" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#111827" /></marker>
        <marker id="arrow-filled" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#111827" /></marker>
      </defs>
      <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.zoom})`}>
        <rect x="0" y="0" width="800" height="600" fill="#1f7a3c" />
        <rect x="0" y="0" width="800" height="600" fill="none" stroke="#ffffff" strokeWidth="4" />
        {[...Array(13)].map((_, i) => <line key={i} x1={i * (800 / 12)} y1={0} x2={i * (800 / 12)} y2={600} stroke="#ffffff" opacity={0.45} />)}
        {[120, 180, 420, 480].map((y) => <line key={y} x1={0} y1={y} x2={800} y2={y} stroke="#ffffff" opacity={0.25} />)}
        <rect x="0" y="0" width="80" height="600" fill="#14532d" opacity={0.75} />

        {elements.map((el) => {
          if (el.type === 'player') {
            const selected = selectedIds?.has(el.id);
            const isCenter = el.position.toUpperCase() === 'C';
            const lb = ['MIKE', 'WILL', 'SAM', 'LB'].some((s) => el.position.toUpperCase().includes(s));
            return (
              <g key={el.id} onPointerDown={(evt) => onPlayerPointerDown?.(el.id, evt, el.x, el.y)}>
                {el.side === 'offense' && !isCenter ? <circle cx={el.x} cy={el.y} r={15} fill="#111827" stroke={selected ? '#f59e0b' : '#111827'} strokeWidth={selected ? 3 : 1} /> : null}
                {isCenter ? <rect x={el.x - 10} y={el.y - 10} width={20} height={20} fill="#111827" stroke={selected ? '#f59e0b' : '#111827'} strokeWidth={selected ? 3 : 1} /> : null}
                <text x={el.x} y={el.y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={el.side === 'offense' ? '#fff' : lb ? '#16a34a' : '#111827'}>{el.position.toUpperCase()}</text>
              </g>
            );
          }
          if (el.type === 'text') return <text key={el.id} x={el.x} y={el.y} fontSize={el.fontSize ?? 16} fill={el.color ?? '#111827'}>{el.text}</text>;
          if (el.type === 'zone') return <polygon key={el.id} points={el.points.map((p) => `${p.x},${p.y}`).join(' ')} fill={el.color} opacity={el.opacity} />;
          const marker = el.type === 'block' ? 'url(#arrow-filled)' : 'url(#arrow-open)';
          return <path key={el.id} d={pathData(el.points)} fill="none" stroke={el.color} strokeWidth={3} strokeDasharray={el.type === 'motion' || el.lineType === 'dashed' ? '8 6' : undefined} markerEnd={marker} />;
        })}

        {previewPath && previewPath.length > 1 ? <path d={pathData(previewPath)} fill="none" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} /> : null}
      </g>
    </svg>
  );
}
