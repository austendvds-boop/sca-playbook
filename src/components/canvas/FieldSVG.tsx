"use client";
import { useAtom } from 'jotai';
import { activeToolAtom, elementsAtom } from '@/atoms/canvas';
import { CanvasElement } from '@/lib/store';
import { v4 as uuid } from 'uuid';
import { PlaySVGRenderer } from '@/components/shared/PlaySVGRenderer';

export function FieldSVG(){
 const [tool]=useAtom(activeToolAtom); const [elements,setElements]=useAtom(elementsAtom);
 const arr=[...elements.values()];
 const onClick=(e:React.MouseEvent<SVGSVGElement>)=>{ const r=e.currentTarget.getBoundingClientRect(); const x=(e.clientX-r.left)*800/r.width; const y=(e.clientY-r.top)*600/r.height;
   if(tool==='player'){ const el:CanvasElement={id:uuid(),type:'player',x,y,position:'X',side:'offense'}; setElements(new Map(elements).set(el.id,el)); }
   if(tool==='text'){ const el:CanvasElement={id:uuid(),type:'text',x,y,text:'Label'}; setElements(new Map(elements).set(el.id,el)); }
 }
 return <div className="w-full h-full" onDoubleClick={()=>{}}><div className="h-[70vh] border"><PlaySVGRenderer elements={arr} className="w-full h-full"/></div><p className="text-xs p-2">Tool: {tool}. Click field to place player/text.</p></div>
}
