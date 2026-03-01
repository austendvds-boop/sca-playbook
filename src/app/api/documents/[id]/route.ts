import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { documents } from '@/db/schema';
import { defaultPlayCardLayout, normalizePlayCardLayout } from '@/lib/installSheet';

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const db = getDb();
    const [d] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    if (!d) return NextResponse.json({ data: null, error: 'Document not found' }, { status: 404 });

    if (d.docType === 'play_card') {
      return NextResponse.json({
        data: {
          ...d,
          updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : new Date().toISOString(),
          layoutData: normalizePlayCardLayout(d.layoutData || defaultPlayCardLayout)
        }
      });
    }

    return NextResponse.json({ data: { ...d, updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : new Date().toISOString() } });
  } catch (error) {
    console.error('GET /api/documents/[id] failed', error);
    return NextResponse.json({ data: null, error: 'Failed to load document' }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const db = getDb();

    const [existing] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    if (!existing) return NextResponse.json({ data: null, error: 'Document not found' }, { status: 404 });

    if (existing.docType === 'play_card') {
      const nextLayout = normalizePlayCardLayout(body.layoutData || existing.layoutData || defaultPlayCardLayout);
      const [updated] = await db
        .update(documents)
        .set({
          name: body.name ?? existing.name,
          layoutData: nextLayout,
          updatedAt: new Date()
        })
        .where(eq(documents.id, id))
        .returning();

      return NextResponse.json({
        data: {
          ...updated,
          updatedAt: updated.updatedAt ? new Date(updated.updatedAt).toISOString() : new Date().toISOString(),
          layoutData: normalizePlayCardLayout(updated.layoutData || defaultPlayCardLayout)
        }
      });
    }

    const [updated] = await db
      .update(documents)
      .set({
        name: body.name ?? existing.name,
        layoutData: body.layoutData ?? existing.layoutData,
        updatedAt: new Date()
      })
      .where(eq(documents.id, id))
      .returning();

    return NextResponse.json({ data: { ...updated, updatedAt: updated.updatedAt ? new Date(updated.updatedAt).toISOString() : new Date().toISOString() } });
  } catch (error) {
    console.error('PUT /api/documents/[id] failed', error);
    return NextResponse.json({ data: null, error: 'Failed to save document' }, { status: 500 });
  }
}

