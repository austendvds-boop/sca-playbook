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
