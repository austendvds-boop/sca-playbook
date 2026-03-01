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
  family: 'SCA',
  concept: 'Base',
  playName: 'New Install Sheet',
  description: '',
  diagrams: [{ key: 'diagram_1', playId: null, labelTop: '', labelBottom: '' }],
  assignments: [
    { position: 'QB', assignment: '' },
    { position: 'RB', assignment: '' },
    { position: 'FB', assignment: '' },
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

const samplePlay = (id: string, name: string, offset = 0): Play => ({
  id,
  name,
  tags: ['general'],
  situation: 'general',
  canvasData: [
    { id: `${id}-c`, type: 'player', x: 400 + offset, y: 340, position: 'C', side: 'offense' },
    { id: `${id}-qb`, type: 'player', x: 400 + offset, y: 390, position: 'QB', side: 'offense' },
    { id: `${id}-x`, type: 'player', x: 180 + offset, y: 260, position: 'X', side: 'offense' },
    { id: `${id}-r1`, type: 'route', points: [{ x: 180 + offset, y: 260 }, { x: 180 + offset, y: 130 }], color: '#111827', lineStyle: 'route' }
  ],
  updatedAt: new Date().toISOString()
});

const g = globalThis as unknown as { __scaStore?: { plays: Play[]; folders: Folder[]; docs: DocumentRec[] } };
if (!g.__scaStore) {
  const p1 = samplePlay('p1', 'Trips Right Slant');
  const p2 = samplePlay('p2', 'Inside Zone', 40);
  const p3 = samplePlay('p3', 'Cover 3 Buzz', -40);
  g.__scaStore = {
    folders: [
      { id: 'f1', name: 'Run Game' },
      { id: 'f2', name: 'Pass Game' },
      { id: 'f3', name: 'Defense' }
    ],
    plays: [p1, p2, p3],
    docs: [
      {
        id: 'd1',
        name: 'Sample Install Sheet',
        docType: 'play_card',
        layoutData: { ...defaultPlayCard(), diagrams: [{ key: 'diagram_1', playId: p1.id, labelTop: '', labelBottom: '' }] },
        updatedAt: new Date().toISOString()
      }
    ]
  };
}

export const store = g.__scaStore;
export const makeDefaultDocLayout = (docType: 'play_card' | 'reference_sheet') => (docType === 'reference_sheet' ? defaultRefSheet() : defaultPlayCard());








