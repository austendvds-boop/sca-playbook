"use client";
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { FieldSVG } from '@/components/canvas/FieldSVG';
import { elementsAtom } from '@/atoms/canvas';

export default function PlayEdit({ params }: { params: { id: string } }) {
  const [elements, setElements] = useAtom(elementsAtom);
  useEffect(() => {
    fetch(`/api/plays/${params.id}`).then((r) => r.json()).then((d) => {
      const map = new Map();
      (d.data?.canvasData ?? []).forEach((e: { id: string }) => map.set(e.id, e));
      setElements(map);
    });
  }, [params.id, setElements]);

  const save = async () => {
    const svg = document.querySelector('svg');
    const thumbnailSvg = svg ? new XMLSerializer().serializeToString(svg) : '';
    await fetch(`/api/plays/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ canvasData: [...elements.values()], thumbnailSvg }) });
  };

  return <main><CanvasToolbar onSave={save} /><div className='space-y-3 p-4'><div className='flex gap-2'><button className='rounded border px-3 py-1' onClick={async()=>{await fetch(`/api/plays/${params.id}/duplicate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mirror:true})});}}>Mirror Play</button><button className='rounded border px-3 py-1' onClick={async()=>{const svg=document.querySelector('svg'); if(!svg) return; const raw = new XMLSerializer().serializeToString(svg); const svgBlob = new Blob([raw], {type:'image/svg+xml;charset=utf-8'}); const url = URL.createObjectURL(svgBlob); const img = new Image(); img.onload = () => { const c=document.createElement('canvas'); c.width=1200; c.height=900; const ctx=c.getContext('2d'); if(!ctx) return; ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,c.width,c.height); ctx.drawImage(img,0,0,c.width,c.height); c.toBlob((b)=>{ if(!b) return; const durl=URL.createObjectURL(b); const a=document.createElement('a'); a.href=durl; a.download='play.png'; a.click(); URL.revokeObjectURL(durl);},'image/png'); URL.revokeObjectURL(url); }; img.src=url;}}>Export PNG</button></div><FieldSVG /></div></main>;
}
