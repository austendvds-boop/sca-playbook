import { NextResponse } from 'next/server';
import { createPlay, listPlays } from '@/lib/playPersistence';

export async function POST() {
  try {
    const existing = await listPlays();
    if (existing.length > 0) {
      return NextResponse.json({ data: 'already' });
    }

    await createPlay({
      name: 'Trips Right Mesh',
      tags: ['3rd_down'],
      situation: 'general',
      canvasData: [],
      thumbnailSvg: ''
    });

    return NextResponse.json({ data: 'seeded' });
  } catch (error) {
    console.error('POST /api/seed failed', error);
    return NextResponse.json({ data: null, error: 'Failed to seed data' }, { status: 500 });
  }
}
