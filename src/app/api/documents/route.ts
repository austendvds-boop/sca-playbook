import { NextResponse } from 'next/server';
import { makeDefaultDocLayout, store } from '@/lib/store';

export async function GET() { return NextResponse.json({ data: store.docs, count: store.docs.length }); }
export async function POST(req: Request) {
  const body = (await req.json()) as { name?: string; docType?: 'play_card' | 'reference_sheet' };
  const docType = body.docType ?? 'play_card';
  const doc = { id: crypto.randomUUID(), name: body.name || 'New Document', docType, layoutData: makeDefaultDocLayout(docType), updatedAt: new Date().toISOString() };
  store.docs.unshift(doc);
  return NextResponse.json({ data: doc });
}
