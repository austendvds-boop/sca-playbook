"use client";
import { useEffect, useRef, useState } from 'react';

export function EditableText({ value, onSave, className }: { value: string; onSave: (v: string) => void; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setDraft(value), [value]);
  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);
  if (!editing) return <div className={className} onDoubleClick={() => setEditing(true)}>{value || ' '}</div>;
  return <div ref={ref} className={className} contentEditable suppressContentEditableWarning onInput={(e)=>setDraft(e.currentTarget.textContent ?? '')} onBlur={()=>{setEditing(false);onSave(draft);}} onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();setEditing(false);onSave(draft);} if(e.key==='Escape'){e.preventDefault();setEditing(false);setDraft(value);}}}>{draft}</div>;
}
