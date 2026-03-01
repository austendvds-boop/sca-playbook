"use client";
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { FieldSVG } from '@/components/canvas/FieldSVG';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { elementsAtom } from '@/atoms/canvas';

export default function PlayEdit({params}:{params:{id:string}}){
 const [elements,setElements]=useAtom(elementsAtom);
 useEffect(()=>{fetch(`/api/plays/${params.id}`).then(r=>r.json()).then(d=>{const m=new Map();(d.data?.canvasData||[]).forEach((e:any)=>m.set(e.id,e));setElements(m);});},[params.id,setElements]);
 const save=async()=>{await fetch(`/api/plays/${params.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({canvasData:[...elements.values()]})}); alert('Saved');};
 return <main><CanvasToolbar/><div className='p-4'><button onClick={save} className='bg-[#CC0000] text-white px-3 py-2 rounded mb-3'>Save</button><FieldSVG/></div></main>
}
