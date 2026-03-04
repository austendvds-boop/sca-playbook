import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST() {
  try {
    if (store.plays.length > 0) {
      return NextResponse.json({ data: 'already' });
    }

    store.plays.push({
      id: crypto.randomUUID(),
      name: 'Trips Right Mesh',
      tags: ['3rd_down'],
      situation: 'general',
      canvasData: [],
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ data: 'seeded' });
  } catch (error) {
    console.error('POST /api/seed failed', error);
    return NextResponse.json({ data: null, error: 'Failed to seed data' }, { status: 500 });
  }
}
