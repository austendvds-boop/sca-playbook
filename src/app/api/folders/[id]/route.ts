import { NextResponse } from 'next/server';
import { deleteFolder, updateFolder } from '@/lib/playPersistence';

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as { name?: unknown };
    const name = typeof body.name === 'string' ? body.name : 'New Folder';
    const f = await updateFolder(id, name);
    if (!f) return NextResponse.json({ error: 'Not found or seed folder is read-only' }, { status: 404 });
    return NextResponse.json({ data: f });
  } catch (error) {
    console.error('PUT /api/folders/[id] failed', error);
    return NextResponse.json({ data: null, error: 'Failed to update folder' }, { status: 500 });
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await deleteFolder(id);
    return NextResponse.json({ data: true });
  } catch (error) {
    console.error('DELETE /api/folders/[id] failed', error);
    return NextResponse.json({ data: null, error: 'Failed to delete folder' }, { status: 500 });
  }
}
