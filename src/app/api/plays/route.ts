import { NextResponse } from 'next/server';
import { type CanvasElement } from '@/lib/store';
import { createPlay, getSeedPlays, listPlays } from '@/lib/playPersistence';

export async function GET(req: Request) {
  const u = new URL(req.url);
  const search = (u.searchParams.get('search') ?? '').toLowerCase();
  const tag = u.searchParams.get('tag') ?? '';
  const folderId = u.searchParams.get('folderId') ?? '';

  const dbPlays = await listPlays();
  const plays = [...dbPlays, ...getSeedPlays()].filter(
    (p) => (!search || p.name.toLowerCase().includes(search)) && (!tag || p.tags.includes(tag)) && (!folderId || p.folderId === folderId)
  );

  return NextResponse.json({ data: plays, count: plays.length });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<{ name: string; tags: string[]; folderId: string; situation: string; canvasData: CanvasElement[]; thumbnailSvg: string }>;
  const play = await createPlay({
    name: body.name,
    tags: body.tags,
    folderId: body.folderId,
    situation: body.situation,
    canvasData: body.canvasData,
    thumbnailSvg: body.thumbnailSvg
  });
  return NextResponse.json({ data: play });
}
