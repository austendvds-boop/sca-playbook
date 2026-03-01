import { NextResponse } from 'next/server';
import { duplicatePlay } from '@/lib/playPersistence';

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { mirror } = (await req.json().catch(() => ({ mirror: false }))) as { mirror?: boolean };
  const copy = await duplicatePlay(id, Boolean(mirror));
  if (!copy) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: copy });
}
