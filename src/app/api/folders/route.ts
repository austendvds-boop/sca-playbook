import { NextResponse } from 'next/server';
import { createFolder, getSeedFolders, listFolders } from '@/lib/playPersistence';

export async function GET() {
  const data = [...getSeedFolders(), ...(await listFolders())];
  return NextResponse.json({ data, count: data.length });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { name?: string; parentId?: string };
  const folder = await createFolder(body.name || 'New Folder', body.parentId);
  return NextResponse.json({ data: folder });
}
