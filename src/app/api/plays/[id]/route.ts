import { NextResponse } from 'next/server';
import { deletePlay, getPlay, updatePlay } from '@/lib/playPersistence';

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const p = await getPlay(id);
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: p });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const p = await updatePlay(id, body);
  if (!p) return NextResponse.json({ error: 'Not found or seed play is read-only' }, { status: 404 });
  return NextResponse.json({ data: p });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await deletePlay(id);
  return NextResponse.json({ data: true });
}
