import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const p = store.plays.find((x) => x.id === id);
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: p });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const p = store.plays.find((x) => x.id === id);
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  Object.assign(p, body, { updatedAt: new Date().toISOString() });
  return NextResponse.json({ data: p });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  store.plays = store.plays.filter((x) => x.id !== id);
  return NextResponse.json({ data: true });
}
