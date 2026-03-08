import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

export const teams = pgTable('teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const folders = pgTable('folders_app', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  parentId: text('parent_id'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const plays = pgTable('plays_app', {
  id: text('id').primaryKey(),
  folderId: text('folder_id'),
  name: text('name').notNull(),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  situation: text('situation'),
  canvasData: jsonb('canvas_data').$type<unknown[]>().notNull().default([]),
  thumbnailSvg: text('thumbnail_svg'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id'),
  name: text('name').notNull(),
  docType: text('doc_type').notNull(),
  layoutData: jsonb('layout_data').notNull(),
  updatedAt: timestamp('updated_at').defaultNow()
});
