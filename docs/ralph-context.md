# Ralph Context

## Batch CT-B1 — Canvas Hook Extraction + Save UX (2026-03-08)

### Files Created
- `src/hooks/useCanvasEditor.ts`

### Files Modified
- `src/app/plays/[id]/page.tsx`
- `src/app/plays/new/page.tsx`
- `src/components/canvas/FieldSVG.tsx`

### `useCanvasEditor` key exports
- State: `elements`, `selected`, `undoStack`, `redoStack`, `saveStatus`, `canUndo`, `canRedo`
- Canvas actions: `applyCanvasChange`, `replaceCanvas`, `insertPlayer`, `insertOLGroup`, `applyPreset`, `deleteSelected`
- History actions: `handleUndo`, `handleRedo`
- Save action: `requestSaveNow(canvasDataOverride?)`
- Selection utility: `setSelected`
- Preset labels: `offensePresetNames`, `defensePresetNames`

### Save UX added
- Autosave debounce: 3s after element changes
- Manual save path shared with autosave via `requestSaveNow`
- Save status states exposed: `idle | saving | saved | error`
- Saved state auto-clears to idle after 2s
- Error state persists until next successful save
- Ctrl+S wired in `FieldSVG` (`preventDefault` + callback)

### Gotchas / Notes for next batch
- Autosave only tracks canvas element changes; name/tag updates are still separate API writes in `[id]` page.
- `replaceCanvas` intentionally resets undo/redo and skips autosave once (for load/init).
- New-play page still creates on first save and redirects; if it has already created an ID before redirect completes, subsequent saves use PUT.

---

## Batch CT-B2 — Data Layer Consolidation + Thumbnail Payload Reduction (2026-03-08)

### Files Modified
- `src/db/schema.ts`
- `src/db/index.ts`
- `src/lib/playPersistence.ts`
- `src/lib/store.ts`
- `src/hooks/useCanvasEditor.ts`
- `src/app/api/plays/route.ts`
- `src/app/api/folders/route.ts`
- `src/app/api/seed/route.ts`
- `package.json`
- `package-lock.json`

### Data layer changes
- Replaced raw `postgres` SQL in `playPersistence` with Drizzle queries using shared `getDb()` from `src/db/index.ts`.
- Removed `ensureTables()` and all raw SQL DDL/DML from the play/folder persistence path.
- Eliminated seed/fallback behavior from play/folder read paths:
  - removed `getSeedPlays` / `getSeedFolders`
  - removed all API route seed merges
- `/api/seed` no longer mutates in-memory state; it now seeds the DB (idempotent: no-op when plays already exist).

### Table names now used
- Plays: `plays_app`
- Folders: `folders_app`
- Documents remain on `documents`

### Thumbnail/storage behavior
- `useCanvasEditor` save payload now always sends `thumbnailSvg: ''` (stops storing serialized full-field SVG snapshots).
- `/api/plays` list response now strips `thumbnailSvg` from each play object to reduce payload size.

### Gotchas / Notes for next batch
- `thumbnailSvg` still exists on the schema/type and can be returned by single-play endpoints; list endpoint intentionally omits it.
- Folder delete still nulls `plays.folder_id` and bumps `updated_at` for affected plays.
- `drizzle-kit` moved to `devDependencies`; lockfile updated accordingly.
