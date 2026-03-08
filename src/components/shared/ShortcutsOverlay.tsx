"use client";

import { useEffect } from 'react';

const SHORTCUTS = [
  { keys: 'R', description: 'Route tool' },
  { keys: 'M', description: 'Move tool' },
  { keys: 'B', description: 'Ball carrier' },
  { keys: 'S', description: 'Select' },
  { keys: 'Z', description: 'Undo' },
  { keys: 'Shift + Z', description: 'Redo' },
  { keys: 'Ctrl + S', description: 'Save' },
  { keys: 'Delete / Backspace', description: 'Delete selected' },
  { keys: 'Escape', description: 'Deselect' },
  { keys: '?', description: 'Show this help' }
];

export function ShortcutsOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        className="w-full max-w-xl rounded-xl bg-white p-5 text-slate-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Keyboard shortcuts</h2>
        <p className="mt-1 text-sm text-slate-600">Press ? to close this panel.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.keys} className="rounded-md border border-slate-200 px-3 py-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{shortcut.keys}</div>
              <div className="text-sm text-slate-800">{shortcut.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
