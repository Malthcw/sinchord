import type { ChordShape } from '@/types/chord';

export const CHORD_LIBRARY: readonly ChordShape[] = [
  { name: 'G',      baseFret: 1, frets: [3, 2, 0, 0, 0, 3] },
  { name: 'C',      baseFret: 1, frets: [null, 3, 2, 0, 1, 0] },
  { name: 'D',      baseFret: 1, frets: [null, null, 0, 2, 3, 2] },
  { name: 'Em',     baseFret: 1, frets: [0, 2, 2, 0, 0, 0] },
  { name: 'Am',     baseFret: 1, frets: [null, 0, 2, 2, 1, 0] },
  { name: 'E',      baseFret: 1, frets: [0, 2, 2, 1, 0, 0] },
  { name: 'A',      baseFret: 1, frets: [null, 0, 2, 2, 2, 0] },
  { name: 'Dm',     baseFret: 1, frets: [null, null, 0, 2, 3, 1] },
  { name: 'Cadd9',  baseFret: 1, frets: [null, 3, 2, 0, 3, 3] },
  { name: 'Em7',    baseFret: 1, frets: [0, 2, 2, 0, 3, 0] },
  { name: 'Asus2',  baseFret: 1, frets: [null, 0, 2, 2, 0, 0] },
  { name: 'Dsus4',  baseFret: 1, frets: [null, null, 0, 2, 3, 3] },
  { name: 'Fmaj7',  baseFret: 1, frets: [null, null, 3, 2, 1, 0] },
  { name: 'A7',     baseFret: 1, frets: [null, 0, 2, 0, 2, 0] },
  { name: 'G/B',    baseFret: 1, frets: [null, 2, 0, 0, 0, 3] },
  { name: 'D/F#',   baseFret: 1, frets: [2, null, 0, 2, 3, 2] },
  { name: 'F',      baseFret: 1, frets: [1, 3, 3, 2, 1, 1], barre: { fret: 1, fromString: 0, toString: 5 } },
  { name: 'Bm',     baseFret: 1, frets: [null, 2, 4, 4, 3, 2], barre: { fret: 2, fromString: 1, toString: 5 } },
];

export function pickRandomChords(count: number): ChordShape[] {
  const pool = [...CHORD_LIBRARY];

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = pool[i];
    const b = pool[j];
    if (a === undefined || b === undefined) continue;
    pool[i] = b;
    pool[j] = a;
  }

  return pool.slice(0, Math.min(count, pool.length));
}