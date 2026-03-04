import { NextResponse } from 'next/server';
import { type CanvasElement, type Play } from '@/lib/store';
import { deletePlay, getPlay, updatePlay } from '@/lib/playPersistence';

type UpdatePlayBody = Partial<Pick<Play, 'name' | 'folderId' | 'tags' | 'situation' | 'thumbnailSvg'>> & {
  canvasData?: CanvasElement[];
};

function parseUpdateBody(input: unknown): UpdatePlayBody {
  if (!input || typeof input !== 'object') return {};
  const body = input as Record<string, unknown>;

  return {
    name: typeof body.name === 'string' ? body.name : undefined,
    folderId: typeof body.folderId === 'string' ? body.folderId : undefined,
    tags: Array.isArray(body.tags) ? body.tags.filter((tag): tag is string => typeof tag === 'string') : undefined,
    situation: typeof body.situation === 'string' ? body.situation : undefined,
    canvasData: Array.isArray(body.canvasData) ? (body.canvasData as CanvasElement[]) : undefined,
    thumbnailSvg: typeof body.thumbnailSvg === 'string' ? body.thumbnailSvg : undefined
  };
}

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const p = await getPlay(id);
    if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: p });
  } catch (error) {
    console.error('GET /api/plays/[id] failed', error);
    return NextResponse.json({ data: null, error: 'Failed to load play' }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = parseUpdateBody(await req.json().catch(() => ({})));
    const p = await updatePlay(id, body);
    if (!p) return NextResponse.json({ error: 'Not found or seed play is read-only' }, { status: 404 });
    return NextResponse.json({ data: p });
  } catch (error) {
    console.error('PUT /api/plays/[id] failed', error);
    return NextResponse.json({ data: null, error: 'Failed to update play' }, { status: 500 });
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await deletePlay(id);
    return NextResponse.json({ data: true });
  } catch (error) {
    console.error('DELETE /api/plays/[id] failed', error);
    return NextResponse.json({ data: null, error: 'Failed to delete play' }, { status: 500 });
  }
}
