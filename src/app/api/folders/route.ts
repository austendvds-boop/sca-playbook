import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { v4 as uuid } from 'uuid';

export async function GET() { return NextResponse.json({ data: store.folders, count: store.folders.length }); }
export async function POST(req: Request) {
  const body = (await req.json()) as { name?: string; parentId?: string };
  const folder = { id: uuid(), name: body.name || 'New Folder', parentId: body.parentId };
  store.folders.push(folder);
  return NextResponse.json({ data: folder });
}
