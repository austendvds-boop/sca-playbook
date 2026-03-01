import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { defaultPlayCardLayout, normalizePlayCardLayout } from '@/lib/installSheet';

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const d = store.docs.find((x) => x.id === id);
  if (!d) return NextResponse.json({ data: null, error: 'Document not found' }, { status: 404 });

  if (d.docType === 'play_card') {
    return NextResponse.json({ data: { ...d, layoutData: normalizePlayCardLayout(d.layoutData || defaultPlayCardLayout) } });
  }

  return NextResponse.json({ data: d });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const d = store.docs.find((x) => x.id === id);
  if (!d) return NextResponse.json({ data: null, error: 'Document not found' }, { status: 404 });

  if (d.docType === 'play_card') {
    const nextLayout = normalizePlayCardLayout(body.layoutData || d.layoutData || defaultPlayCardLayout);
    Object.assign(d, body, { layoutData: nextLayout, updatedAt: new Date().toISOString() });
    return NextResponse.json({ data: d });
  }

  Object.assign(d, body, { updatedAt: new Date().toISOString() });
  return NextResponse.json({ data: d });
}
