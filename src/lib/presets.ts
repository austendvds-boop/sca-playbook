import { CanvasElement } from '@/lib/store';

type Preset = { name: string; elements: CanvasElement[] };
const o = (id: string, x: number, y: number, p: string): CanvasElement => ({ id, type: 'player', x, y, position: p, side: 'offense' });
const d = (id: string, x: number, y: number, p: string): CanvasElement => ({ id, type: 'player', x, y, position: p, side: 'defense' });

export const offensePresets: Preset[] = [
  { name: 'Shotgun Spread', elements: [o('c', 400, 340, 'C'), o('qb', 400, 390, 'QB'), o('x', 150, 250, 'X'), o('z', 650, 250, 'Z')] },
  { name: 'Shotgun Trips Right', elements: [o('c', 400, 340, 'C'), o('qb', 400, 390, 'QB'), o('x', 150, 260, 'X'), o('h', 550, 260, 'H'), o('y', 610, 260, 'Y'), o('z', 670, 260, 'Z')] },
  { name: 'Shotgun Trips Left', elements: [o('c', 400, 340, 'C'), o('qb', 400, 390, 'QB'), o('x', 130, 260, 'X'), o('h', 190, 260, 'H'), o('y', 250, 260, 'Y'), o('z', 650, 260, 'Z')] },
  { name: 'Shotgun Empty', elements: [o('c', 400, 340, 'C'), o('qb', 400, 390, 'QB'), o('x', 130, 250, 'X'), o('h', 260, 250, 'H'), o('y', 400, 250, 'Y'), o('z', 540, 250, 'Z'), o('f', 670, 250, 'F')] },
  { name: 'Singleback', elements: [o('c', 400, 340, 'C'), o('qb', 400, 370, 'QB'), o('rb', 400, 420, 'RB')] },
  { name: 'Singleback Twins', elements: [o('c', 400, 340, 'C'), o('qb', 400, 370, 'QB'), o('rb', 400, 420, 'RB'), o('x', 200, 260, 'X'), o('z', 260, 260, 'Z')] },
  { name: 'I-Formation', elements: [o('c', 400, 340, 'C'), o('qb', 400, 365, 'QB'), o('fb', 400, 405, 'FB'), o('tb', 400, 445, 'TB')] },
  { name: 'I-Form Strong', elements: [o('c', 400, 340, 'C'), o('qb', 400, 365, 'QB'), o('fb', 400, 405, 'FB'), o('tb', 400, 445, 'TB'), o('te', 470, 330, 'TE')] },
  { name: 'Pistol', elements: [o('c', 400, 340, 'C'), o('qb', 400, 385, 'QB'), o('rb', 400, 430, 'RB')] },
  { name: 'Pistol Trips', elements: [o('c', 400, 340, 'C'), o('qb', 400, 385, 'QB'), o('rb', 400, 430, 'RB'), o('h', 550, 260, 'H'), o('y', 610, 260, 'Y'), o('z', 670, 260, 'Z')] },
  { name: 'Goal Line', elements: [o('c', 400, 340, 'C'), o('qb', 400, 365, 'QB'), o('fb', 400, 405, 'FB'), o('tb', 400, 445, 'TB'), o('te1', 470, 330, 'TE'), o('te2', 330, 330, 'TE')] },
  { name: 'Wildcat', elements: [o('c', 400, 340, 'C'), o('rb', 400, 390, 'RB'), o('qb', 230, 390, 'QB')] },
  { name: 'Pro Set', elements: [o('c', 400, 340, 'C'), o('qb', 400, 365, 'QB'), o('fb', 360, 405, 'FB'), o('tb', 440, 405, 'TB')] },
  { name: 'Ace', elements: [o('c', 400, 340, 'C'), o('qb', 400, 365, 'QB'), o('rb', 400, 420, 'RB'), o('teL', 330, 330, 'TE'), o('teR', 470, 330, 'TE')] }
];

export const defensePresets: Preset[] = [
  { name: '4-3 Over', elements: [d('de1', 300, 300, 'DE'), d('dt1', 360, 300, 'DT'), d('dt2', 440, 300, 'DT'), d('de2', 500, 300, 'DE'), d('sam', 300, 250, 'SAM'), d('mike', 400, 240, 'MIKE'), d('will', 500, 250, 'WILL')] },
  { name: '4-3 Under', elements: [d('de1', 290, 300, 'DE'), d('nt', 380, 300, 'NT'), d('dt', 450, 300, 'DT'), d('de2', 520, 300, 'DE'), d('sam', 300, 245, 'SAM'), d('mike', 400, 240, 'MIKE'), d('will', 500, 245, 'WILL')] },
  { name: '3-4 Base', elements: [d('de1', 320, 300, 'DE'), d('nt', 400, 300, 'NT'), d('de2', 480, 300, 'DE'), d('sam', 260, 250, 'SAM'), d('mike', 370, 240, 'MIKE'), d('will', 430, 240, 'WILL'), d('jack', 540, 250, 'JACK')] },
  { name: 'Nickel 4-2-5', elements: [d('de1', 300, 300, 'DE'), d('dt1', 360, 300, 'DT'), d('dt2', 440, 300, 'DT'), d('de2', 500, 300, 'DE'), d('mike', 380, 245, 'MIKE'), d('will', 420, 245, 'WILL')] },
  { name: 'Dime 4-1-6', elements: [d('de1', 300, 300, 'DE'), d('dt1', 360, 300, 'DT'), d('dt2', 440, 300, 'DT'), d('de2', 500, 300, 'DE'), d('mike', 400, 240, 'MIKE')] },
  { name: '3-3-5 Stack', elements: [d('de1', 320, 300, 'DE'), d('nt', 400, 300, 'NT'), d('de2', 480, 300, 'DE'), d('sam', 340, 250, 'SAM'), d('mike', 400, 250, 'MIKE'), d('will', 460, 250, 'WILL')] },
  { name: '46 Defense', elements: [d('de1', 300, 300, 'DE'), d('dt1', 360, 300, 'DT'), d('dt2', 440, 300, 'DT'), d('de2', 500, 300, 'DE'), d('lb1', 340, 250, 'LB'), d('lb2', 400, 250, 'LB'), d('lb3', 460, 250, 'LB')] },
  { name: 'Cover 2 Shell', elements: [d('fs', 320, 180, 'FS'), d('ss', 480, 180, 'SS')] },
  { name: 'Cover 3 Shell', elements: [d('cb1', 230, 200, 'CB'), d('fs', 400, 170, 'FS'), d('cb2', 570, 200, 'CB')] },
  { name: 'Cover 4 Shell', elements: [d('s1', 260, 180, 'S'), d('s2', 360, 180, 'S'), d('s3', 440, 180, 'S'), d('s4', 540, 180, 'S')] },
  { name: 'Cover 1 / Man Free', elements: [d('fs', 400, 180, 'FS')] },
  { name: 'Cover 0 / Man', elements: [] }
];
