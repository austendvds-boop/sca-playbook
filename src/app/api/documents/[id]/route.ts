import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const d = store.docs.find((x) => x.id === id);
  if (!d) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: d });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const d = store.docs.find((x) => x.id === id);
  if (!d) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  Object.assign(d, body, { updatedAt: new Date().toISOString() });
  return NextResponse.json({ data: d });
}
