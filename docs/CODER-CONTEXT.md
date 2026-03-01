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