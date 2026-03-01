"use client";
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { FieldSVG } from '@/components/canvas/FieldSVG';
import { useAtom } from 'jotai';
import { elementsAtom } from '@/atoms/canvas';

export default function NewPlay(){
 const [elements]=useAtom(elementsAtom);
 const save=async()=>{await fetch('/api/plays',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'New Play',canvasData:[...elements.values()],tags:[]})}); alert('Saved');};
 return <main><CanvasToolbar/><div className='p-4'><button onClick={save} className='bg-[#CC0000] text-white px-3 py-2 rounded mb-3'>Save</button><FieldSVG/></div></main>
}
