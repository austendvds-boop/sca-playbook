import { CanvasElement } from '@/lib/store';

type Preset = { name: string; elements: CanvasElement[] };

const o = (id: string, x: number, y: number, position: string): CanvasElement => ({
  id,
  type: 'player',
  x,
  y,
  position,
  side: 'offense'
});

const d = (id: string, x: number, y: number, position: string): CanvasElement => ({
  id,
  type: 'player',
  x,
  y,
  position,
  side: 'defense'
});

export const offensePresets: Preset[] = [
  {
    name: 'Shotgun',
    elements: [o('lt', 380, 280, 'LT'), o('lg', 440, 280, 'LG'), o('c', 500, 280, 'C'), o('rg', 560, 280, 'RG'), o('rt', 620, 280, 'RT'), o('te', 680, 280, 'TE'), o('qb', 500, 350, 'QB'), o('rb', 440, 350, 'RB'), o('x', 200, 280, 'X'), o('z', 800, 280, 'Z')]
  },
  {
    name: 'Shotgun Trips',
    elements: [o('lt', 380, 280, 'LT'), o('lg', 440, 280, 'LG'), o('c', 500, 280, 'C'), o('rg', 560, 280, 'RG'), o('rt', 620, 280, 'RT'), o('qb', 500, 350, 'QB'), o('x', 150, 280, 'X'), o('z', 680, 280, 'Z'), o('slot', 740, 300, 'H'), o('y', 800, 320, 'Y')]
  },
  {
    name: 'Empty',
    elements: [o('lt', 380, 280, 'LT'), o('lg', 440, 280, 'LG'), o('c', 500, 280, 'C'), o('rg', 560, 280, 'RG'), o('rt', 620, 280, 'RT'), o('qb', 500, 350, 'QB'), o('x', 100, 300, 'X'), o('slotl', 320, 340, 'H'), o('slotr', 680, 340, 'H'), o('z', 900, 300, 'Z'), o('y', 500, 420, 'Y')]
  },
  {
    name: 'I-Form',
    elements: [o('lt', 380, 280, 'LT'), o('lg', 440, 280, 'LG'), o('c', 500, 280, 'C'), o('rg', 560, 280, 'RG'), o('rt', 620, 280, 'RT'), o('te', 680, 280, 'TE'), o('qb', 500, 310, 'QB'), o('fb', 500, 320, 'FB'), o('tb', 500, 370, 'RB'), o('x', 150, 280, 'X'), o('z', 850, 280, 'Z')]
  },
  {
    name: 'Singleback',
    elements: [o('lt', 380, 280, 'LT'), o('lg', 440, 280, 'LG'), o('c', 500, 280, 'C'), o('rg', 560, 280, 'RG'), o('rt', 620, 280, 'RT'), o('te', 680, 280, 'TE'), o('qb', 500, 310, 'QB'), o('rb', 500, 340, 'RB'), o('x', 150, 280, 'X'), o('z', 850, 280, 'Z')]
  },
  {
    name: 'Pistol',
    elements: [o('lt', 380, 280, 'LT'), o('lg', 440, 280, 'LG'), o('c', 500, 280, 'C'), o('rg', 560, 280, 'RG'), o('rt', 620, 280, 'RT'), o('te', 680, 280, 'TE'), o('qb', 500, 320, 'QB'), o('rb', 500, 340, 'RB'), o('x', 150, 280, 'X'), o('z', 850, 280, 'Z')]
  },
  {
    name: 'Wildcat',
    elements: [o('lt', 380, 280, 'LT'), o('lg', 440, 280, 'LG'), o('c', 500, 280, 'C'), o('rg', 560, 280, 'RG'), o('rt', 620, 280, 'RT'), o('rb', 500, 340, 'RB'), o('qb', 200, 280, 'QB'), o('wr', 800, 280, 'WR'), o('te', 680, 280, 'TE'), o('util', 560, 340, 'FB')]
  },
  {
    name: 'Goal Line',
    elements: [o('tel', 350, 280, 'Y'), o('lt', 400, 280, 'LT'), o('lg', 450, 280, 'LG'), o('c', 500, 280, 'C'), o('rg', 550, 280, 'RG'), o('rt', 600, 280, 'RT'), o('ter', 650, 280, 'Y'), o('qb', 500, 300, 'QB'), o('fbl', 480, 320, 'FB'), o('fbr', 520, 320, 'FB'), o('tb', 500, 350, 'RB')]
  }
];

export const defensePresets: Preset[] = [
  {
    name: '4-3 Over',
    elements: [d('de1', 320, 260, 'DE'), d('dt', 420, 265, 'DT'), d('nt', 520, 265, 'NT'), d('de2', 680, 260, 'DE'), d('w', 380, 220, 'W'), d('m', 500, 225, 'M'), d('s', 620, 220, 'S'), d('cb1', 200, 170, 'CB'), d('cb2', 800, 170, 'CB'), d('ss', 420, 120, 'SS'), d('fs', 580, 120, 'FS')]
  },
  {
    name: '4-3 Under',
    elements: [d('de1', 280, 260, 'DE'), d('dt', 380, 265, 'DT'), d('nt', 480, 265, 'NT'), d('de2', 640, 260, 'DE'), d('w', 580, 220, 'W'), d('m', 440, 225, 'M'), d('s', 700, 220, 'S'), d('cb1', 150, 170, 'CB'), d('cb2', 850, 170, 'CB'), d('ss', 400, 120, 'SS'), d('fs', 600, 120, 'FS')]
  },
  {
    name: '3-4 Base',
    elements: [d('de1', 380, 260, 'DE'), d('nt', 500, 265, 'NT'), d('de2', 620, 260, 'DE'), d('w', 320, 215, 'W'), d('m', 440, 220, 'M'), d('s', 560, 220, 'S'), d('b', 680, 215, 'B'), d('cb1', 150, 170, 'CB'), d('cb2', 850, 170, 'CB'), d('ss', 420, 120, 'SS'), d('fs', 580, 120, 'FS')]
  },
  {
    name: 'Nickel',
    elements: [d('de1', 320, 260, 'DE'), d('dt1', 440, 265, 'DT'), d('dt2', 560, 265, 'DT'), d('de2', 680, 260, 'DE'), d('m', 460, 220, 'M'), d('w', 540, 220, 'W'), d('cb1', 150, 170, 'CB'), d('cb2', 850, 170, 'CB'), d('money', 650, 180, '$'), d('ss', 400, 120, 'SS'), d('fs', 600, 120, 'FS')]
  },
  {
    name: 'Dime',
    elements: [d('de1', 320, 260, 'DE'), d('dt1', 440, 265, 'DT'), d('dt2', 560, 265, 'DT'), d('de2', 680, 260, 'DE'), d('m', 500, 220, 'M'), d('cb1', 120, 170, 'CB'), d('cb2', 880, 170, 'CB'), d('d1', 350, 190, '$'), d('d2', 650, 190, '$'), d('ss', 420, 120, 'SS'), d('fs', 580, 120, 'FS')]
  },
  {
    name: 'Cover 2',
    elements: [d('de1', 340, 260, 'DE'), d('dt1', 440, 265, 'DT'), d('dt2', 560, 265, 'DT'), d('de2', 660, 260, 'DE'), d('w', 380, 220, 'W'), d('m', 500, 200, 'M'), d('s', 620, 220, 'S'), d('cb1', 200, 200, 'CB'), d('cb2', 800, 200, 'CB'), d('fs1', 380, 100, 'FS'), d('fs2', 620, 100, 'FS')]
  },
  {
    name: 'Cover 3',
    elements: [d('de1', 340, 260, 'DE'), d('dt1', 440, 265, 'DT'), d('dt2', 560, 265, 'DT'), d('de2', 660, 260, 'DE'), d('w', 350, 220, 'W'), d('m', 500, 215, 'M'), d('s', 650, 220, 'S'), d('cb1', 200, 130, 'CB'), d('cb2', 800, 130, 'CB'), d('fs', 500, 110, 'FS'), d('ss', 580, 190, 'SS')]
  },
  {
    name: 'Cover 0',
    elements: [d('de1', 340, 260, 'DE'), d('dt1', 440, 265, 'DT'), d('dt2', 560, 265, 'DT'), d('de2', 660, 260, 'DE'), d('w', 380, 240, 'W'), d('s', 620, 240, 'S'), d('m', 500, 200, 'M'), d('cb1', 200, 280, 'CB'), d('cb2', 800, 280, 'CB'), d('ss', 350, 200, 'SS'), d('fs', 650, 200, 'FS')]
  },
  {
    name: '46',
    elements: [d('de1', 300, 260, 'DE'), d('dt', 400, 265, 'DT'), d('nt', 500, 265, 'NT'), d('de2', 660, 260, 'DE'), d('w', 360, 230, 'W'), d('m', 500, 235, 'M'), d('s', 640, 230, 'S'), d('ss', 580, 250, 'SS'), d('cb1', 150, 170, 'CB'), d('cb2', 850, 170, 'CB'), d('fs', 500, 100, 'FS')]
  },
  {
    name: '3-3-5',
    elements: [d('de1', 400, 260, 'DE'), d('nt', 500, 265, 'NT'), d('de2', 600, 260, 'DE'), d('w', 400, 210, 'W'), d('m', 500, 215, 'M'), d('s', 600, 210, 'S'), d('cb1', 150, 170, 'CB'), d('cb2', 850, 170, 'CB'), d('money', 300, 180, '$'), d('ss', 420, 120, 'SS'), d('fs', 580, 120, 'FS')]
  }
];
