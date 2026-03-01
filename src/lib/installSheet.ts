import type { PlayCardLayout } from '@/lib/store';

export const defaultPlayCardLayout: PlayCardLayout = {
  family: '',
  concept: '',
  playName: '',
  description: '',
  diagrams: [
    { key: 'a', playId: null, labelTop: 'LABEL', labelBottom: '' },
    { key: 'b', playId: null, labelTop: 'LABEL', labelBottom: '' }
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
  notes: '',
  slot1Label: 'LABEL',
  slot2Label: 'LABEL'
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

  const normalizedDiagrams = diagrams.length > 0 ? diagrams : defaultPlayCardLayout.diagrams.map((d) => ({ ...d }));

  return {
    family: raw.family ?? defaultPlayCardLayout.family,
    concept: raw.concept ?? defaultPlayCardLayout.concept,
    playName: raw.playName ?? defaultPlayCardLayout.playName,
    description: raw.description ?? defaultPlayCardLayout.description,
    diagrams: normalizedDiagrams,
    assignments:
      Array.isArray(raw.assignments) && raw.assignments.length > 0
        ? raw.assignments.map((row) => ({ position: row.position ?? '', assignment: row.assignment ?? '' }))
        : defaultPlayCardLayout.assignments.map((r) => ({ ...r })),
    notes: raw.notes ?? defaultPlayCardLayout.notes,
    slot1Label: raw.slot1Label ?? normalizedDiagrams[0]?.labelTop ?? 'LABEL',
    slot2Label: raw.slot2Label ?? normalizedDiagrams[1]?.labelTop ?? 'LABEL'
  };
}
