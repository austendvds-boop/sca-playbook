import { NextResponse } from 'next/server';
import { type CanvasElement } from '@/lib/store';
import { createPlay, listPlays } from '@/lib/playPersistence';

type CreatePlayBody = Partial<{
  name: string;
  tags: string[];
  folderId: string;
  situation: string;
  canvasData: CanvasElement[];
  thumbnailSvg: string;
}>;

function parseCreateBody(input: unknown): CreatePlayBody {
  if (!input || typeof input !== 'object') return {};
  const body = input as Record<string, unknown>;

  return {
    name: typeof body.name === 'string' ? body.name : undefined,
    tags: Array.isArray(body.tags) ? body.tags.filter((tag): tag is string => typeof tag === 'string') : undefined,
    folderId: typeof body.folderId === 'string' ? body.folderId : undefined,
    situation: typeof body.situation === 'string' ? body.situation : undefined,
    canvasData: Array.isArray(body.canvasData) ? (body.canvasData as CanvasElement[]) : undefined,
    thumbnailSvg: typeof body.thumbnailSvg === 'string' ? body.thumbnailSvg : undefined
  };
}

export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const search = (u.searchParams.get('search') ?? '').toLowerCase();
    const tag = u.searchParams.get('tag') ?? '';
    const folderId = u.searchParams.get('folderId') ?? '';

    const plays = (await listPlays())
      .filter((p) => (!search || p.name.toLowerCase().includes(search)) && (!tag || p.tags.includes(tag)) && (!folderId || p.folderId === folderId))
      .map(({ thumbnailSvg, ...playWithoutThumbnail }) => playWithoutThumbnail);

    return NextResponse.json({ data: plays, count: plays.length });
  } catch (error) {
    console.error('GET /api/plays failed', error);
    return NextResponse.json({ data: null, error: 'Failed to load plays' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = parseCreateBody(await req.json().catch(() => ({})));
    const play = await createPlay(body);
    return NextResponse.json({ data: play });
  } catch (error) {
    console.error('POST /api/plays failed', error);
    return NextResponse.json({ data: null, error: 'Failed to create play' }, { status: 500 });
  }
}
