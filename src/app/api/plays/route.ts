import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { v4 as uuid } from 'uuid';

export async function GET(){ return NextResponse.json({data: store.plays, count: store.plays.length}); }
export async function POST(req:Request){ const body=await req.json(); const play={id:uuid(),name:body.name||'Untitled',tags:body.tags||[],situation:body.situation||'',folderId:body.folderId,canvasData:body.canvasData||[],thumbnailSvg:'',updatedAt:new Date().toISOString()}; store.plays.unshift(play); return NextResponse.json({data:play}); }
