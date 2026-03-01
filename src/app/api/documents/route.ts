import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
export async function GET(){ return NextResponse.json({data:store.docs,count:store.docs.length}); }
export async function POST(req:Request){ const body=await req.json(); const doc={id:crypto.randomUUID(),name:body.name||'New Document',docType:body.docType||'play_card',layoutData:body.layoutData||{},updatedAt:new Date().toISOString()}; store.docs.unshift(doc); return NextResponse.json({data:doc}); }
