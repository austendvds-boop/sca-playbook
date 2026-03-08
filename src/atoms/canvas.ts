import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { CanvasElement } from '@/lib/store';

export type Tool = 'select' | 'player' | 'route' | 'dashed_route' | 'tbar' | 'zone';
export type FieldType = 'half' | 'full' | 'redzone';
export type Viewport = { x: number; y: number; zoom: number };

export const DEFAULT_CANVAS_PLAY_ID = 'new';

export const elementsAtomFamily = atomFamily((playId: string) => atom<Map<string, CanvasElement>>(new Map()), Object.is);
export const selectedIdsAtomFamily = atomFamily((playId: string) => atom<Set<string>>(new Set<string>()), Object.is);
export const activeToolAtomFamily = atomFamily((playId: string) => atom<Tool>('select'), Object.is);
export const fieldTypeAtomFamily = atomFamily((playId: string) => atom<FieldType>('half'), Object.is);
export const viewportAtomFamily = atomFamily((playId: string) => atom<Viewport>({ x: 0, y: 0, zoom: 1 }), Object.is);
export const undoStackAtomFamily = atomFamily((playId: string) => atom<CanvasElement[][]>([]), Object.is);
export const redoStackAtomFamily = atomFamily((playId: string) => atom<CanvasElement[][]>([]), Object.is);

// Backward-compatible defaults for code paths that still use singleton imports.
export const elementsAtom = elementsAtomFamily(DEFAULT_CANVAS_PLAY_ID);
export const selectedIdsAtom = selectedIdsAtomFamily(DEFAULT_CANVAS_PLAY_ID);
export const activeToolAtom = activeToolAtomFamily(DEFAULT_CANVAS_PLAY_ID);
export const fieldTypeAtom = fieldTypeAtomFamily(DEFAULT_CANVAS_PLAY_ID);
export const viewportAtom = viewportAtomFamily(DEFAULT_CANVAS_PLAY_ID);
export const undoStackAtom = undoStackAtomFamily(DEFAULT_CANVAS_PLAY_ID);
export const redoStackAtom = redoStackAtomFamily(DEFAULT_CANVAS_PLAY_ID);
