import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = (await req.json()) as { name?: string };
  const f = store.folders.find((x) => x.id === id);
  if (!f) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (body.name) f.name = body.name;
  return NextResponse.json({ data: f });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  store.folders = store.folders.filter((x) => x.id !== id);
  store.plays = store.plays.map((p) => (p.folderId === id ? { ...p, folderId: undefined } : p));
  return NextResponse.json({ data: true });
}
