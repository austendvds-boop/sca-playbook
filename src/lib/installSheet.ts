import type { PlayCardLayout } from '@/lib/store';

export const defaultPlayCardLayout: PlayCardLayout = {
  family: '',
  concept: '',
  playName: '',
  description: '',
  diagrams: [
    { key: 'a', playId: null, labelTop: '', labelBottom: '' },
    { key: 'b', playId: null, labelTop: '', labelBottom: '' }
  ],
  assignments: [
    { position: 'PST', assignment: '' },
    { position: 'PSG', assignment: '' },
    { position: 'OC', assignment: '' },
    { position: 'BSG', assignment: '' },
    { position: 'BST', assignment: '' },
    { position: 'Y', assignment: '' },
    { position: 'X', assignment: '' },
    { position: 'Z', assignment: '' },
    { position: 'H/S', assignment: '' },
    { position: 'A', assignment: '' },
    { position: 'QB', assignment: '' }
  ],
  notes: ''
};

export function normalizePlayCardLayout(input: unknown): PlayCardLayout {
  const raw = (input ?? {}) as Partial<PlayCardLayout>;
  const diagrams = Array.isArray(raw.diagrams)
    ? raw.diagrams
        .filter(Boolean)
        .map((d, i) => ({
          key: d.key || String.fromCharCode(97 + i),
          playId: d.playId ?? null,
          labelTop: d.labelTop ?? '',
          labelBottom: d.labelBottom ?? ''
        }))
    : [];

  return {
    family: raw.family ?? defaultPlayCardLayout.family,
    concept: raw.concept ?? defaultPlayCardLayout.concept,
    playName: raw.playName ?? defaultPlayCardLayout.playName,
    description: raw.description ?? defaultPlayCardLayout.description,
    diagrams: diagrams.length > 0 ? diagrams : defaultPlayCardLayout.diagrams.map((d) => ({ ...d })),
    assignments:
      Array.isArray(raw.assignments) && raw.assignments.length > 0
        ? raw.assignments.map((row) => ({ position: row.position ?? '', assignment: row.assignment ?? '' }))
        : defaultPlayCardLayout.assignments.map((r) => ({ ...r })),
    notes: raw.notes ?? defaultPlayCardLayout.notes
  };
}

