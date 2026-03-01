import { NextResponse } from 'next/server';
import { store, type CanvasElement } from '@/lib/store';
import { v4 as uuid } from 'uuid';

export async function GET(req: Request) {
  const u = new URL(req.url);
  const search = (u.searchParams.get('search') ?? '').toLowerCase();
  const tag = u.searchParams.get('tag') ?? '';
  const folderId = u.searchParams.get('folderId') ?? '';
  const plays = store.plays.filter((p) => (!search || p.name.toLowerCase().includes(search)) && (!tag || p.tags.includes(tag)) && (!folderId || p.folderId === folderId));
  return NextResponse.json({ data: plays, count: plays.length });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<{ name: string; tags: string[]; folderId: string; situation: string; canvasData: CanvasElement[]; thumbnailSvg: string }>;
  const play = {
    id: uuid(),
    name: body.name || 'Untitled Play',
    tags: body.tags || ['general'],
    situation: body.situation || 'general',
    folderId: body.folderId,
    canvasData: body.canvasData || [],
    thumbnailSvg: body.thumbnailSvg || '',
    updatedAt: new Date().toISOString()
  };
  store.plays.unshift(play);
  return NextResponse.json({ data: play });
}
