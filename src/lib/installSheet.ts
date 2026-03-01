import type { PlayCardLayout } from '@/lib/store';

export const defaultPlayCardLayout: PlayCardLayout = {
  family: '',
  concept: '',
  playName: 'New Install Sheet',
  description: '',
  diagrams: [{ key: 'a', playId: null, labelTop: '', labelBottom: '' }],
  assignments: [
    { position: 'QB', assignment: '' },
    { position: 'RB', assignment: '' },
    { position: 'WR (X)', assignment: '' },
    { position: 'WR (Z)', assignment: '' },
    { position: 'WR (H)', assignment: '' },
    { position: 'TE (Y)', assignment: '' },
    { position: 'LT', assignment: '' },
    { position: 'LG', assignment: '' },
    { position: 'C', assignment: '' },
    { position: 'RG', assignment: '' },
    { position: 'RT', assignment: '' }
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
    diagrams: diagrams.length > 0 ? diagrams : defaultPlayCardLayout.diagrams,
    assignments:
      Array.isArray(raw.assignments) && raw.assignments.length > 0
        ? raw.assignments.map((row) => ({ position: row.position ?? '', assignment: row.assignment ?? '' }))
        : defaultPlayCardLayout.assignments,
    notes: raw.notes ?? defaultPlayCardLayout.notes
  };
}

