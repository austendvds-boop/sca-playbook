import { NextResponse } from 'next/server';
import { deleteFolder, updateFolder } from '@/lib/playPersistence';

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = (await req.json()) as { name?: string };
  const f = await updateFolder(id, body.name || 'New Folder');
  if (!f) return NextResponse.json({ error: 'Not found or seed folder is read-only' }, { status: 404 });
  return NextResponse.json({ data: f });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await deleteFolder(id);
  return NextResponse.json({ data: true });
}
