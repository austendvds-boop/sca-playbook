import { NextResponse } from 'next/server';
import { store, type CanvasElement } from '@/lib/store';
import { v4 as uuid } from 'uuid';

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { mirror } = (await req.json().catch(() => ({ mirror: false }))) as { mirror?: boolean };
  const source = store.plays.find((p) => p.id === id);
  if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const canvasData: CanvasElement[] = source.canvasData.map((e) => {
    if (!mirror) return { ...e, id: uuid() };
    if (e.type === 'player') return { ...e, id: uuid(), x: 800 - e.x };
    if (e.type === 'text') return { ...e, id: uuid(), x: 800 - e.x };
    if (e.type === 'zone') return { ...e, id: uuid(), cx: 800 - e.cx };
    return { ...e, id: uuid(), points: e.points.map((p) => ({ x: 800 - p.x, y: p.y })) };
  });
  const copy = { ...source, id: uuid(), name: `${source.name} ${mirror ? '(Mirrored)' : '(Copy)'}`, canvasData, updatedAt: new Date().toISOString() };
  store.plays.unshift(copy);
  return NextResponse.json({ data: copy });
}

