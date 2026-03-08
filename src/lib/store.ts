import { defaultPlayCardLayout } from '@/lib/installSheet';

export type Point = { x: number; y: number };

export type ElementType = 'player' | 'route' | 'block' | 'motion' | 'text' | 'zone';

export type PlayerElement = {
  id: string;
  type: 'player';
  x: number;
  y: number;
  position: string;
  side: 'offense' | 'defense';
  color?: string;
};

export type LineElement = {
  id: string;
  type: 'route' | 'block' | 'motion';
  points: Point[];
  color: string;
  lineStyle: 'route' | 'zigzag' | 'tbar' | 'dashed_route';
  fromPlayerId?: string;
  noArrow?: boolean;
};

export type TextElement = {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  color?: string;
  fontSize?: number;
};

export type ZoneElement = {
  id: string;
  type: 'zone';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color: string;
  opacity: number;
};

export type CanvasElement = PlayerElement | LineElement | TextElement | ZoneElement;

export type Play = {
  id: string;
  name: string;
  folderId?: string;
  tags: string[];
  situation?: string;
  canvasData: CanvasElement[];
  thumbnailSvg?: string;
  updatedAt: string;
};

export type Folder = { id: string; name: string; parentId?: string };

export type DiagramSlot = {
  key: string;
  playId: string | null;
  labelTop: string;
  labelBottom: string;
};

export type AssignmentRow = { position: string; assignment: string };

export type PlayCardLayout = {
  family: string;
  concept: string;
  playName: string;
  description: string;
  diagrams: DiagramSlot[];
  assignments: AssignmentRow[];
  notes: string;
  slot1Label?: string;
  slot2Label?: string;
};

export type ReferenceRow = {
  id: string;
  combination: string;
  description: string;
  diagrams: DiagramSlot[];
};

export type ReferenceLayout = {
  title: string;
  rows: ReferenceRow[];
};

export type DocumentRec = {
  id: string;
  name: string;
  docType: 'play_card' | 'reference_sheet';
  layoutData: PlayCardLayout | ReferenceLayout;
  updatedAt: string;
};

const defaultPlayCard = (): PlayCardLayout => ({
  ...defaultPlayCardLayout,
  diagrams: defaultPlayCardLayout.diagrams.map((diagram) => ({ ...diagram })),
  assignments: defaultPlayCardLayout.assignments.map((row) => ({ ...row }))
});

const defaultRefSheet = (): ReferenceLayout => ({
  title: 'REFERENCE SHEET',
  rows: [
    {
      id: crypto.randomUUID(),
      combination: '',
      description: '',
      diagrams: [{ key: 'row_1_1', playId: null, labelTop: '', labelBottom: '' }]
    }
  ]
});

export const makeDefaultDocLayout = (docType: 'play_card' | 'reference_sheet') => (docType === 'reference_sheet' ? defaultRefSheet() : defaultPlayCard());
