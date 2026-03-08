import { asc, desc, eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { getDb } from '@/db';
import { folders, plays } from '@/db/schema';
import { CanvasElement, Folder, Play } from '@/lib/store';

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return ['general'];
  const tags = value.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0);
  return tags.length > 0 ? tags : ['general'];
}

function normalizeCanvasData(value: unknown): CanvasElement[] {
  if (!Array.isArray(value)) return [];
  return value as CanvasElement[];
}

function toPlay(row: typeof plays.$inferSelect): Play {
  return {
    id: row.id,
    name: row.name,
    folderId: row.folderId ?? undefined,
    tags: normalizeTags(row.tags),
    situation: row.situation ?? 'general',
    canvasData: normalizeCanvasData(row.canvasData),
    thumbnailSvg: row.thumbnailSvg ?? '',
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString()
  };
}

function toFolder(row: typeof folders.$inferSelect): Folder {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parentId ?? undefined
  };
}

export async function listPlays() {
  const db = getDb();
  const rows = await db.select().from(plays).orderBy(desc(plays.updatedAt));
  return rows.map(toPlay);
}

export async function getPlay(id: string) {
  const db = getDb();
  const rows = await db.select().from(plays).where(eq(plays.id, id)).limit(1);
  if (rows.length === 0) return null;
  return toPlay(rows[0]);
}

export async function createPlay(body: Partial<Play>) {
  const db = getDb();

  const nextPlay = {
    id: uuid(),
    name: body.name || 'Untitled Play',
    folderId: body.folderId ?? null,
    tags: body.tags?.length ? body.tags : ['general'],
    situation: body.situation || 'general',
    canvasData: (body.canvasData ?? []) as unknown[],
    thumbnailSvg: body.thumbnailSvg ?? '',
    updatedAt: new Date()
  };

  const [created] = await db.insert(plays).values(nextPlay).returning();
  return toPlay(created);
}

export async function updatePlay(id: string, body: Partial<Play>) {
  const db = getDb();

  const existingRows = await db.select().from(plays).where(eq(plays.id, id)).limit(1);
  if (existingRows.length === 0) return null;

  const existing = toPlay(existingRows[0]);

  const [updated] = await db
    .update(plays)
    .set({
      name: body.name ?? existing.name,
      folderId: body.folderId ?? existing.folderId ?? null,
      tags: body.tags ?? existing.tags,
      situation: body.situation ?? existing.situation ?? 'general',
      canvasData: (body.canvasData ?? existing.canvasData) as unknown[],
      thumbnailSvg: body.thumbnailSvg ?? existing.thumbnailSvg ?? '',
      updatedAt: new Date()
    })
    .where(eq(plays.id, id))
    .returning();

  return toPlay(updated);
}

export async function deletePlay(id: string) {
  const db = getDb();
  await db.delete(plays).where(eq(plays.id, id));
  return true;
}

export async function duplicatePlay(id: string, mirror = false) {
  const source = await getPlay(id);
  if (!source) return null;

  const canvasData: CanvasElement[] = source.canvasData.map((element) => {
    if (!mirror) return { ...element, id: uuid() } as CanvasElement;

    if (element.type === 'player') return { ...element, id: uuid(), x: 1000 - element.x };
    if (element.type === 'text') return { ...element, id: uuid(), x: 1000 - element.x };
    if (element.type === 'zone') return { ...element, id: uuid(), cx: 1000 - element.cx };

    return {
      ...element,
      id: uuid(),
      points: element.points.map((point) => ({ x: 1000 - point.x, y: point.y }))
    };
  });

  return createPlay({
    name: `${source.name} ${mirror ? '(Mirrored)' : '(Copy)'}`,
    folderId: source.folderId,
    tags: source.tags,
    situation: source.situation,
    canvasData,
    thumbnailSvg: ''
  });
}

export async function listFolders() {
  const db = getDb();
  const rows = await db.select().from(folders).orderBy(asc(folders.name));
  return rows.map(toFolder);
}

export async function createFolder(name: string, parentId?: string) {
  const db = getDb();
  const [created] = await db
    .insert(folders)
    .values({
      id: uuid(),
      name: name || 'New Folder',
      parentId: parentId ?? null,
      updatedAt: new Date()
    })
    .returning();

  return toFolder(created);
}

export async function updateFolder(id: string, name: string) {
  const db = getDb();
  const [updated] = await db
    .update(folders)
    .set({
      name,
      updatedAt: new Date()
    })
    .where(eq(folders.id, id))
    .returning();

  if (!updated) return null;
  return toFolder(updated);
}

export async function deleteFolder(id: string) {
  const db = getDb();
  await db.delete(folders).where(eq(folders.id, id));
  await db.update(plays).set({ folderId: null, updatedAt: new Date() }).where(eq(plays.folderId, id));
  return true;
}
