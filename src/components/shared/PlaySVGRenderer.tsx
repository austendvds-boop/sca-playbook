"use client";
import { CanvasElement } from '@/lib/store';

export function PlaySVGRenderer({ elements, className }: { elements: CanvasElement[]; className?: string }) {
  return (
    <svg viewBox="0 0 800 600" className={className} style={{ touchAction: 'none' }}>
      <rect x="0" y="0" width="800" height="600" fill="#F9FAFB" stroke="#ddd" />
      {[...Array(12)].map((_,i)=><line key={i} x1={i*66} y1={0} x2={i*66} y2={600} stroke="#e5e7eb" />)}
      {elements.map((el) => {
        if (el.type === 'player') return <g key={el.id}><circle cx={el.x} cy={el.y} r={14} fill={el.side==='offense' ? '#000':'transparent'} stroke="#000"/><text x={el.x} y={el.y+5} textAnchor="middle" fill={el.side==='offense'?'#fff':'#000'} fontSize="14" fontWeight="700">{el.position}</text></g>;
        if (el.type === 'text') return <text key={el.id} x={el.x} y={el.y} fill="#111827" fontSize="16">{el.text}</text>;
        if (el.type === 'zone') return <polygon key={el.id} points={el.points.map(p=>`${p.x},${p.y}`).join(' ')} fill={el.color} opacity={el.opacity} />;
        return <polyline key={el.id} points={el.points.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke={el.color} strokeDasharray={el.type==='motion' ? '8 8' : undefined} strokeWidth={3}/>;
      })}
    </svg>
  );
}
