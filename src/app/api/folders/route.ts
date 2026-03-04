import { NextResponse } from 'next/server';
import { createFolder, getSeedFolders, listFolders } from '@/lib/playPersistence';

function parseCreateFolderBody(input: unknown): { name?: string; parentId?: string } {
  if (!input || typeof input !== 'object') return {};
  const body = input as Record<string, unknown>;
  return {
    name: typeof body.name === 'string' ? body.name : undefined,
    parentId: typeof body.parentId === 'string' ? body.parentId : undefined
  };
}

export async function GET() {
  try {
    const data = [...getSeedFolders(), ...(await listFolders())];
    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error('GET /api/folders failed', error);
    return NextResponse.json({ data: null, error: 'Failed to load folders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = parseCreateFolderBody(await req.json().catch(() => ({})));
    const folder = await createFolder(body.name || 'New Folder', body.parentId);
    return NextResponse.json({ data: folder });
  } catch (error) {
    console.error('POST /api/folders failed', error);
    return NextResponse.json({ data: null, error: 'Failed to create folder' }, { status: 500 });
  }
}
