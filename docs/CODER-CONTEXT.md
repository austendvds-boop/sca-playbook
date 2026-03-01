# CODER-CONTEXT.md — sca-playbook
Last updated: 2026-03-01

## ChalkTalk bug batch (6 fixes)

Implemented and verified all requested fixes:

1. **Install sheet list titles/use PLAY field**
   - File: `src/app/documents/page.tsx`
   - Card title now uses `layoutData.playName` when present.
   - Fallback title is now `Untitled Install Sheet`.
   - Subtitle now shows `Play: <name>` when available, else `Play: Not assigned`.

2. **Print view PLAY field source corrected**
   - File: `src/app/documents/[id]/print/page.tsx`
   - `PLAY:` now renders `layout.playName` only.
   - No fallback to `doc.name`; blank remains blank.

3. **Sample play OL/C alignment fixed (p1/p2/p3)**
   - File: `src/lib/store.ts`
   - Updated sample plays to include LT/LG/C/RG/RT on LOS (`y: 320`).
   - QB moved behind center (`y: 355`).
   - X and route anchor aligned to LOS.

4. **Install sheet delete action added**
   - Files: `src/app/documents/page.tsx`, `src/app/api/documents/[id]/route.ts`
   - Added per-card Delete button with confirm prompt.
   - Delete calls `DELETE /api/documents/[id]`.
   - Added API `DELETE` handler in route.

5. **LOS raised for better route space**
   - File: `src/components/canvas/FieldBackground.tsx`
   - LOS moved from `y: 280` to `y: 320` (~57% of 560 canvas).
   - Also aligned whiteboard insertion defaults:
     - `src/app/plays/[id]/page.tsx`
     - `src/app/plays/new/page.tsx`
     - field center and OL group now use `y: 320`.

6. **Whiteboard play-name rename now persists inline**
   - File: `src/app/plays/[id]/page.tsx`
   - Header inline rename already existed in toolbar UI.
   - Added `renamePlay()` auto-save to DB on Enter/blur via `PUT /api/plays/[id]`.

## Build status
- Command: `npm run build`
- Result: ✅ Success
- TypeScript: ✅ No errors

## Notes for next agent
- `docs/CODER-CONTEXT.md` did not previously exist in this repo; created during this batch.
- There is still a Next.js warning about inferred Turbopack root due to multiple lockfiles in parent directories (non-blocking).

## 2026-03-01 ChalkTalk full bug + UI fix batch

### Commit / deploy
- Commit: `23332f4`
- Branch: `master`
- Live alias: https://sca-playbook.vercel.app
- Vercel deployment: https://sca-playbook-9h82gnchy-austs-projects-ee024705.vercel.app

### Build status
- Command: `npm run build`
- Result: ✅ Success
- TypeScript: ✅ No errors

### Major changes
- Persistent play/folder storage added (Postgres-backed) with bootstrap table creation:
  - `src/lib/playPersistence.ts` (new)
  - APIs switched from in-memory store to DB-backed repo while still merging seed plays/folders into list responses.
  - Files touched:
    - `src/app/api/plays/route.ts`
    - `src/app/api/plays/[id]/route.ts`
    - `src/app/api/plays/[id]/duplicate/route.ts`
    - `src/app/api/folders/route.ts`
    - `src/app/api/folders/[id]/route.ts`
- Whiteboard (`/plays/[id]`) functional/UI upgrades:
  - Undo/redo wired to canvas mutations (insert/delete/preset/mirror/clear)
  - Mirror now flips current canvas around x=500 (`newX = 1000 - oldX`)
  - Added Clear Canvas action in More Options
  - OL group spawn spacing set to LT/LG/C/RG/RT at 420/460/500/540/580
  - Added tag editor row with toggle + persisted PUT save
  - Added keyboard shortcuts (R/M/B/Z/S/Escape/Delete/Backspace/Cmd/Ctrl+Z/Cmd/Ctrl+Shift+Z)
  - Canvas viewport height constrained (`calc(100vh - 148px)`)
  - File touched: `src/app/plays/[id]/page.tsx`
- Canvas behavior/visuals:
  - Cursor changes by active tool
  - Selected player visual ring/glow
  - OL rendered as square markers (LT/LG/C/RG/RT)
  - File touched: `src/components/shared/PlaySVGRenderer.tsx`
  - File touched: `src/components/canvas/FieldSVG.tsx`
- Field markup enhancements:
  - Added sideline markers at x=20/x=980
  - Added subtle 5-yard interval guide lines + labels above/below LOS
  - File touched: `src/components/canvas/FieldBackground.tsx`
- Install sheet/play picker fixes:
  - Insert Play picker now renders actual SVG previews using shared renderer (no more “No Thumbnail” placeholder)
  - File touched: `src/app/documents/[id]/page.tsx`
- Install sheet header copy tweak:
  - Changed third header cell to `SITUATION:` and placeholder `e.g. 2nd & 8, +40`
  - File touched: `src/components/templates/PlayCardTemplate.tsx`
- New-play OL group spacing aligned with main whiteboard
  - File touched: `src/app/plays/new/page.tsx`

## 2026-03-01 ChalkTalk fix-up pass (QA regressions)

### Build status
- Command: `npm run build`
- Result: ✅ Success (zero errors)

### Fixes implemented
1. **More Options menu restored + ordered correctly**
   - File: `src/components/canvas/CanvasToolbar.tsx`
   - Menu now includes all required actions in order:
     1) Mirror Play
     2) Export PNG
     3) Clear Canvas
     4) Delete Play

2. **Undo/Redo wiring hardened across canvas mutations**
   - Files:
     - `src/app/plays/[id]/page.tsx`
     - `src/components/canvas/FieldSVG.tsx`
   - Added consistent snapshot capture before mutations.
   - Undo/redo now push current state to opposite stack when traversing history.
   - Added max history depth cap of 50 entries.
   - Snapshot cloning now deep-copies line points to avoid mutation bleed.

3. **New Folder persistence + immediate dropdown update**
   - File: `src/app/plays/page.tsx`
   - `New Folder` prompt now trims input, POSTs to `/api/folders`, and appends returned folder directly to local `folders` state.
   - Dropdown remains driven by `folders` state, so it updates immediately without reload.
   - API route verified to include both seed + DB folders on GET:
     - `src/app/api/folders/route.ts`

### Files touched this pass
- `src/components/canvas/CanvasToolbar.tsx`
- `src/components/canvas/FieldSVG.tsx`
- `src/app/plays/[id]/page.tsx`
- `src/app/plays/page.tsx`
- `docs/CODER-CONTEXT.md`

## 2026-03-01 ChalkTalk final 2-issue fix pass

### Build status
- Command: `npm run build`
- Result: ✅ Success (zero errors)

### Fixes implemented
1. **More Options consolidated to one wired dropdown**
   - Files:
     - `src/app/plays/[id]/page.tsx`
     - `src/components/canvas/CanvasToolbar.tsx`
     - `src/app/plays/new/page.tsx`
   - Moved menu action rendering/ordering control into play edit page and left only a single `⋮` toggle surface in toolbar.
   - Dropdown now renders in required order: Mirror Play, Export PNG, Clear Canvas, Delete Play.
   - Dropdown container uses `overflow-visible` to avoid clipping.
   - `Mirror Play` now mirrors all x coordinates (`1000 - x`) including line points **and then saves** via PUT.
   - `Clear Canvas` keeps undo stack behavior via existing `applyCanvasChange` flow.

2. **New Folder persistence and immediate UI update verified/fixed**
   - File: `src/app/plays/page.tsx`
   - New Folder flow already used prompt -> POST `/api/folders` -> append returned folder to `folders` state, with dropdown bound to `folders` state.
   - Confirmed initial `GET /api/folders` runs on mount via `load()` and hydrates `folders` state.
   - API persistence path confirmed in `src/app/api/folders/route.ts` (GET merges seed + DB folders; POST returns created folder in response).

### Notes
- `src/app/plays/new/page.tsx` updated to satisfy `CanvasToolbar` prop signature after menu ownership change.
- Non-blocking Next.js lockfile warning remains unchanged.

## 2026-03-01 ChalkTalk portal + folder dropdown precision pass

### Build status
- Command: `npm run build`
- Result: ✅ Success (zero errors)

### Fixes implemented
1. **More Options dropdown moved to portal with viewport-fixed positioning**
   - Files:
     - `src/components/canvas/CanvasToolbar.tsx`
     - `src/app/plays/[id]/page.tsx`
   - `CanvasToolbar` now portals the dropdown to `document.body` using `createPortal`.
   - Position is computed from the `⋮` button `getBoundingClientRect()` and applied as fixed `top/right`.
   - Portal wrapper uses `z-[9999]` to ensure menu stays above toolbar/tag rows.
   - Removed in-menu absolute positioning so portal owns placement.

2. **New Folder state append logic aligned to requested behavior**
   - File: `src/app/plays/page.tsx`
   - On successful folder creation, dropdown state now appends with `setFolders(prev => [...prev, folder])` (while still deduping by id).
   - Folder `<select>` remains fully state-driven via `folders.map(...)`; no hardcoded folder options.
   - Mount load still fetches `GET /api/folders`; API already merges seed folders + DB folders.

### Files touched
- `src/components/canvas/CanvasToolbar.tsx`
- `src/app/plays/[id]/page.tsx`
- `src/app/plays/page.tsx`
- `docs/CODER-CONTEXT.md`