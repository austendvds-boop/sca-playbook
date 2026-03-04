import { NextResponse } from 'next/server';
import { documents } from '@/db/schema';
import { getDb } from '@/db';
import { normalizePlayCardLayout } from '@/lib/installSheet';
import { makeDefaultDocLayout } from '@/lib/store';
import { desc } from 'drizzle-orm';

type CreateBody = {
  name?: string;
  docType?: 'play_card' | 'reference_sheet';
  layoutData?: unknown;
};

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(documents).orderBy(desc(documents.updatedAt));
    const data = rows.map((row) => ({
      ...row,
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
      layoutData: row.docType === 'play_card' ? normalizePlayCardLayout(row.layoutData) : row.layoutData
    }));

    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error('GET /api/documents failed', error);
    return NextResponse.json({ data: null, error: 'Failed to load documents' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateBody;
    const docType = body.docType ?? 'play_card';
    const name = body.name || (docType === 'play_card' ? 'New Install Sheet' : 'Reference Sheet');
    const layoutData = body.layoutData ?? makeDefaultDocLayout(docType);

    const db = getDb();
    const [created] = await db
      .insert(documents)
      .values({
        name,
        docType,
        layoutData: docType === 'play_card' ? normalizePlayCardLayout(layoutData) : layoutData
      })
      .returning();

    if (!created?.id) {
      console.error('POST /api/documents insert returned no document', { created });
      return NextResponse.json({ data: null, error: 'Failed to create document' }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        ...created,
        updatedAt: created.updatedAt ? new Date(created.updatedAt).toISOString() : new Date().toISOString(),
        layoutData: created.docType === 'play_card' ? normalizePlayCardLayout(created.layoutData) : created.layoutData
      }
    });
  } catch (error) {
    console.error('POST /api/documents failed', error);
    return NextResponse.json({ data: null, error: 'Failed to create document' }, { status: 500 });
  }
}


