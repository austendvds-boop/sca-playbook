export type Point = { x: number; y: number };
export type PlayerElement = { id: string; type: 'player'; x: number; y: number; position: string; side: 'offense'|'defense' };
export type RouteElement = { id: string; type: 'route'|'block'|'motion'; points: Point[]; color: string };
export type TextElement = { id: string; type: 'text'; x: number; y: number; text: string };
export type ZoneElement = { id: string; type: 'zone'; points: Point[]; color: string; opacity: number };
export type CanvasElement = PlayerElement|RouteElement|TextElement|ZoneElement;
export type Play = { id: string; name: string; folderId?: string; tags: string[]; situation?: string; canvasData: CanvasElement[]; thumbnailSvg?: string; updatedAt: string };
export type Folder = { id: string; name: string; parentId?: string };
export type DiagramSlot = { key: string; playId: string | null; labelTop: string; labelBottom: string };
export type DocumentRec = { id: string; name: string; docType: 'play_card'|'reference_sheet'; layoutData: any; updatedAt: string };

const g = globalThis as unknown as { __scaStore?: { plays: Play[]; folders: Folder[]; docs: DocumentRec[] } };
if (!g.__scaStore) {
  g.__scaStore = {
    folders: [{ id: 'f1', name: 'Run Game' }, { id: 'f2', name: 'Pass Game' }, { id: 'f3', name: 'Defense' }],
    plays: [],
    docs: []
  };
}
export const store = g.__scaStore;
