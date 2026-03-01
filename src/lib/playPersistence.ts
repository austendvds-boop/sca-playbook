import postgres from 'postgres';
import { v4 as uuid } from 'uuid';
import { CanvasElement, Folder, Play, store } from '@/lib/store';

const sql: any = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

let ensured: Promise<void> | null = null;
async function ensureTables() {
  if (!ensured) {
    ensured = (async () => {
      await sql`
        create table if not exists plays_app (
          id text primary key,
          name text not null,
          folder_id text,
          tags jsonb not null default '[]'::jsonb,
          situation text,
          canvas_data jsonb not null default '[]'::jsonb,
          thumbnail_svg text,
          updated_at timestamptz not null default now()
        )
      `;
      await sql`
        create table if not exists folders_app (
          id text primary key,
          name text not null,
          parent_id text,
          updated_at timestamptz not null default now()
        )
      `;
    })();
  }
  return ensured;
}

function toPlay(row: any): Play {
  return {
    id: row.id,
    name: row.name,
    folderId: row.folder_id ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : ['general'],
    situation: row.situation ?? 'general',
    canvasData: Array.isArray(row.canvas_data) ? (row.canvas_data as CanvasElement[]) : [],
    thumbnailSvg: row.thumbnail_svg ?? '',
    updatedAt: new Date(row.updated_at ?? Date.now()).toISOString()
  };
}

function toFolder(row: any): Folder {
  return { id: row.id, name: row.name, parentId: row.parent_id ?? undefined };
}

export function getSeedPlays(): Play[] {
  return store.plays.filter((p) => ['p1', 'p2', 'p3'].includes(p.id));
}

export function getSeedFolders(): Folder[] {
  return store.folders.filter((f) => ['f1', 'f2', 'f3'].includes(f.id));
}

export async function listPlays() {
  await ensureTables();
  const rows = await sql`select * from plays_app order by updated_at desc`;
  return rows.map(toPlay);
}

export async function getPlay(id: string) {
  await ensureTables();
  const rows = await sql`select * from plays_app where id = ${id} limit 1`;
  if (rows.length) return toPlay(rows[0]);
  if (['p1', 'p2', 'p3'].includes(id)) return getSeedPlays().find((p) => p.id === id) ?? null;
  return null;
}

export async function createPlay(body: Partial<Play>) {
  await ensureTables();
  const play: Play = {
    id: uuid(),
    name: body.name || 'Untitled Play',
    folderId: body.folderId,
    tags: body.tags?.length ? body.tags : ['general'],
    situation: body.situation || 'general',
    canvasData: body.canvasData || [],
    thumbnailSvg: body.thumbnailSvg || '',
    updatedAt: new Date().toISOString()
  };

  await sql`insert into plays_app (id, name, folder_id, tags, situation, canvas_data, thumbnail_svg, updated_at)
            values (${play.id}, ${play.name}, ${play.folderId ?? null}, ${sql.json(play.tags)}, ${play.situation}, ${sql.json(play.canvasData)}, ${play.thumbnailSvg}, now())`;
  return play;
}

export async function updatePlay(id: string, body: Partial<Play>) {
  const existing = await getPlay(id);
  if (!existing) return null;

  const next: Play = {
    ...existing,
    ...body,
    tags: body.tags ?? existing.tags ?? ['general'],
    canvasData: body.canvasData ?? existing.canvasData,
    updatedAt: new Date().toISOString()
  };

  await ensureTables();
  await sql`insert into plays_app (id, name, folder_id, tags, situation, canvas_data, thumbnail_svg, updated_at)
            values (${id}, ${next.name}, ${next.folderId ?? null}, ${sql.json(next.tags)}, ${next.situation ?? null}, ${sql.json(next.canvasData)}, ${next.thumbnailSvg ?? ''}, now())
            on conflict (id) do update set
              name = excluded.name,
              folder_id = excluded.folder_id,
              tags = excluded.tags,
              situation = excluded.situation,
              canvas_data = excluded.canvas_data,
              thumbnail_svg = excluded.thumbnail_svg,
              updated_at = now()`;
  return next;
}

export async function deletePlay(id: string) {
  await ensureTables();
  await sql`delete from plays_app where id = ${id}`;
  return true;
}

export async function duplicatePlay(id: string, mirror = false) {
  const source = await getPlay(id);
  if (!source) return null;
  const canvasData: CanvasElement[] = source.canvasData.map((e) => {
    if (!mirror) return { ...e, id: uuid() } as CanvasElement;
    if (e.type === 'player') return { ...e, id: uuid(), x: 1000 - e.x };
    if (e.type === 'text') return { ...e, id: uuid(), x: 1000 - e.x };
    if (e.type === 'zone') return { ...e, id: uuid(), cx: 1000 - e.cx };
    return { ...e, id: uuid(), points: e.points.map((p) => ({ x: 1000 - p.x, y: p.y })) };
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
  await ensureTables();
  const rows = await sql`select * from folders_app order by name asc`;
  return rows.map(toFolder);
}

export async function createFolder(name: string, parentId?: string) {
  await ensureTables();
  const folder: Folder = { id: uuid(), name: name || 'New Folder', parentId };
  await sql`insert into folders_app (id, name, parent_id, updated_at) values (${folder.id}, ${folder.name}, ${folder.parentId ?? null}, now())`;
  return folder;
}

export async function updateFolder(id: string, name: string) {
  if (['f1', 'f2', 'f3'].includes(id)) return null;
  await ensureTables();
  await sql`update folders_app set name = ${name}, updated_at = now() where id = ${id}`;
  const rows = await sql`select * from folders_app where id = ${id} limit 1`;
  if (!rows.length) return null;
  return toFolder(rows[0]);
}

export async function deleteFolder(id: string) {
  if (['f1', 'f2', 'f3'].includes(id)) return false;
  await ensureTables();
  await sql`delete from folders_app where id = ${id}`;
  await sql`update plays_app set folder_id = null where folder_id = ${id}`;
  return true;
}
