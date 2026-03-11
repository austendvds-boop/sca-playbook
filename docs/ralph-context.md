# Ralph Context

## Batch CT-B3 - Reference Sheet Print Support + Loading Skeleton States (2026-03-08)

### Files Modified
- `src/app/documents/[id]/print/page.tsx`
- `src/app/plays/page.tsx`
- `src/app/documents/page.tsx`
- `src/app/documents/[id]/page.tsx`
- `src/app/page.tsx`
- `docs/ralph-context.md`

### Changes implemented
- Added `reference_sheet` handling in the document print page with a dedicated print-friendly layout for combinations, descriptions, and attached diagrams.
- Kept the existing `play_card` print branch intact while changing the loading copy to `Preparing document...`.
- Hid the print-page loading indicator during print with `@media print`.
- Replaced bare loading states with Tailwind skeletons in:
  - `src/app/plays/page.tsx`
  - `src/app/documents/page.tsx`
  - `src/app/documents/[id]/page.tsx`
- Updated the home page count fetch flow so successful requests show real counts, failed requests show `-`, and the stats row uses a subtle pulse while loading.

### Verification
- `npm run build` reached Next.js compile and TypeScript, then failed in this sandbox with `spawn EPERM`.
- `npx tsc --noEmit` passed.

### Gotchas / Notes
- The documents list still only exposes the `New Install Sheet` button in its header; reference sheets are supported by the document model and print route but not added to that list-page action in this batch.
- The `next build` failure appears environment-level rather than code-level because compilation completed before the blocked spawn.

---

## Batch CT-B3 Retry - Print Loading Class + Build Verification (2026-03-08)

### Files Modified
- `src/app/documents/[id]/print/page.tsx`
- `docs/ralph-context.md`

### Changes implemented
- Aligned the print loading indicator class to the requested `.loading` selector.
- Kept the loading message text as `Preparing document...` and ensured it remains hidden during print via `@media print`.

### Verification
- `npm run build` passed successfully (Next.js compile + TypeScript + page generation).

### Gotchas / Notes
- Existing CT-B3 UX changes were already present in the branch; this retry focused on class-name alignment and a clean build pass for verification.

---

## Batch CT-B4 - Polish Pass (2026-03-08)

### Files Modified
- `src/components/shared/PlaySVGRenderer.tsx`
- `src/components/shared/EditableText.tsx`
- `src/components/canvas/CanvasToolbar.tsx`
- `src/components/canvas/FieldSVG.tsx`
- `src/components/shared/ShortcutsOverlay.tsx` (new)
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/components/shared/ErrorBoundary.tsx` (new)
- `src/atoms/canvas.ts`
- `src/hooks/useCanvasEditor.ts`
- `src/app/plays/[id]/page.tsx`
- `src/app/plays/new/page.tsx`
- `src/app/documents/[id]/page.tsx`
- `public/file.svg` (deleted)
- `public/globe.svg` (deleted)
- `public/next.svg` (deleted)
- `public/vercel.svg` (deleted)
- `public/window.svg` (deleted)

### Key changes
- Accessibility pass:
  - Added SVG-level `role="img"` + descriptive `aria-label` in `PlaySVGRenderer`.
  - Added aria labels on interactive SVG player/route elements.
  - Added `role="textbox"`, `aria-label`, and `aria-multiline` to editable content areas.
  - Added keyboard-visible focus rings and explicit aria labels across canvas toolbar controls.
  - Darkened red toolbar action backgrounds from `#CC0000` to `#A40000` for stronger text contrast.
- Keyboard shortcut overlay:
  - Added `ShortcutsOverlay` modal (`?` toggles open/close; dismiss via `?`, `Escape`, or backdrop click).
  - Wired key handling in `FieldSVG` while ignoring events when text inputs/contentEditable are focused.
- Homepage optimization + metadata:
  - Replaced CSS background image usage on home hero with `next/image` (`fill`, `priority`, `sizes="100vw"`).
  - Added Open Graph and Twitter metadata in `layout.tsx` (title/description/image and twitter card fields).
- Error boundaries:
  - Added class-based `ErrorBoundary` with plain-language fallback and Reload button.
  - Wrapped play editor pages (`/plays/[id]`, `/plays/new`) and document editor (`/documents/[id]`).
- Canvas atom architecture migration:
  - Migrated canvas atoms to `atomFamily` keyed by play ID for isolated per-play state.
  - Updated `useCanvasEditor`, `FieldSVG`, and `CanvasToolbar` to consume atom families.
  - Added backward-compatible singleton exports keyed to default `playId = 'new'`.
- Public asset cleanup:
  - Confirmed no code references to boilerplate SVGs, then removed unused files from `public/`.

### Verification
- `npm run build` ✅ passed (Next.js build + TypeScript + page generation).
- Build note: Jotai prints a deprecation warning for `atomFamily` recommending `jotai-family`; current implementation is functional.

### Final notes
- Existing print-page `.loading` class updates from CT-B3 Retry remain intact.
- Shortcut behavior now prioritizes `Z` / `Shift+Z` undo/redo per spec; zone tool remains available from toolbar button.

---

## Batch B1 - Custom 404 Page + Page Metadata (2026-03-11)

### Files Modified
- `src/app/page.tsx`
- `src/app/HomePageClient.tsx` (new)
- `src/app/plays/page.tsx`
- `src/app/plays/PlaysPageClient.tsx` (new)
- `src/app/documents/page.tsx`
- `src/app/documents/DocumentsPageClient.tsx` (new)
- `src/app/not-found.tsx` (new)
- `docs/ralph-context.md`

### Changes implemented
- Added a custom App Router 404 page using the existing SCA navy/white/red branding, the SCA logo, plain-language copy, and a home link.
- Added page-level metadata for the home page, play library, and install sheets routes.
- Preserved the existing base metadata in `src/app/layout.tsx` and relied on page-level metadata to override the route title/description.
- Split the three route files into server wrappers plus colocated client components so metadata can be exported without changing client-side page behavior.

### Verification
- `npm run build` passed successfully (Next.js production build, TypeScript, and static page generation).

### Gotchas / Notes
- Next.js does not allow `metadata` exports from `use client` page files, so each affected route now uses a server `page.tsx` that renders a separate client component.
- The existing non-blocking Turbopack root warning and Jotai `atomFamily` deprecation warning still appear during build.
