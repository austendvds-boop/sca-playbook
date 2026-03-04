import { NextResponse } from 'next/server';
import { duplicatePlay } from '@/lib/playPersistence';

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({ mirror: false }))) as { mirror?: unknown };
    const copy = await duplicatePlay(id, Boolean(body?.mirror));
    if (!copy) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: copy });
  } catch (error) {
    console.error('POST /api/plays/[id]/duplicate failed', error);
    return NextResponse.json({ data: null, error: 'Failed to duplicate play' }, { status: 500 });
  }
}
