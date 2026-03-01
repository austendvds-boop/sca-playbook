import { atom } from 'jotai';
import { CanvasElement } from '@/lib/store';

export const elementsAtom = atom<Map<string, CanvasElement>>(new Map());
export const selectedIdsAtom = atom<Set<string>>(new Set<string>());
export const activeToolAtom = atom<'select'|'player'|'route'|'block'|'motion'|'text'|'zone'>('select');
export const viewportAtom = atom({ x: 0, y: 0, zoom: 1 });
export const undoStackAtom = atom<Map<string, CanvasElement>[]>([]);
export const redoStackAtom = atom<Map<string, CanvasElement>[]>([]);
