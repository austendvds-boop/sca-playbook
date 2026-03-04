import { atom } from 'jotai';
import { CanvasElement } from '@/lib/store';

export type Tool = 'select' | 'player' | 'route' | 'dashed_route' | 'tbar' | 'zone';
export type FieldType = 'half' | 'full' | 'redzone';

// TODO(architecture): Move canvas state to atomFamily keyed by play id so multiple tabs/edit sessions do not share a single global canvas snapshot.
export const elementsAtom = atom<Map<string, CanvasElement>>(new Map());
export const selectedIdsAtom = atom<Set<string>>(new Set<string>());
export const activeToolAtom = atom<Tool>('select');
export const fieldTypeAtom = atom<FieldType>('half');
export const viewportAtom = atom({ x: 0, y: 0, zoom: 1 });
export const undoStackAtom = atom<CanvasElement[][]>([]);
export const redoStackAtom = atom<CanvasElement[][]>([]);

