"use client";
import { useAtom } from 'jotai';
import { activeToolAtom } from '@/atoms/canvas';
const tools = ['select','player','route','block','motion','text','zone'] as const;
export function CanvasToolbar(){
 const [active,setActive]=useAtom(activeToolAtom);
 return <div className="flex gap-2 p-2 border-b bg-white">{tools.map(t=><button key={t} className={`px-3 py-1 rounded text-sm ${active===t?'bg-[#CC0000] text-white':'bg-gray-100'}`} onClick={()=>setActive(t)}>{t.toUpperCase()}</button>)}</div>
}
