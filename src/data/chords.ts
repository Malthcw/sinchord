import type { ChordShape } from '@/types/chord';
import { NOTE_SEQUENCE } from '@/utils/chordTranspose';

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

  // Movable barre shapes filling out the remaining roots (E-shape/A-shape for
  // major, Em-shape/Am-shape for minor), so every chromatic root has a chord
  // shape to transpose to. Whichever template lands closer to the nut wins.
  { name: 'C#',  baseFret: 4, frets: [null, 4, 6, 6, 6, 4], barre: { fret: 4, fromString: 1, toString: 5 } },
  { name: 'D#',  baseFret: 6, frets: [null, 6, 8, 8, 8, 6], barre: { fret: 6, fromString: 1, toString: 5 } },
  { name: 'F#',  baseFret: 2, frets: [2, 4, 4, 3, 2, 2], barre: { fret: 2, fromString: 0, toString: 5 } },
  { name: 'G#',  baseFret: 4, frets: [4, 6, 6, 5, 4, 4], barre: { fret: 4, fromString: 0, toString: 5 } },
  { name: 'A#',  baseFret: 1, frets: [null, 1, 3, 3, 3, 1], barre: { fret: 1, fromString: 1, toString: 5 } },
  { name: 'B',   baseFret: 2, frets: [null, 2, 4, 4, 4, 2], barre: { fret: 2, fromString: 1, toString: 5 } },
  { name: 'Cm',  baseFret: 3, frets: [null, 3, 5, 5, 4, 3], barre: { fret: 3, fromString: 1, toString: 5 } },
  { name: 'C#m', baseFret: 4, frets: [null, 4, 6, 6, 5, 4], barre: { fret: 4, fromString: 1, toString: 5 } },
  { name: 'D#m', baseFret: 6, frets: [null, 6, 8, 8, 7, 6], barre: { fret: 6, fromString: 1, toString: 5 } },
  { name: 'Fm',  baseFret: 1, frets: [1, 3, 3, 1, 1, 1], barre: { fret: 1, fromString: 0, toString: 5 } },
  { name: 'F#m', baseFret: 2, frets: [2, 4, 4, 2, 2, 2], barre: { fret: 2, fromString: 0, toString: 5 } },
  { name: 'Gm',  baseFret: 3, frets: [3, 5, 5, 3, 3, 3], barre: { fret: 3, fromString: 0, toString: 5 } },
  { name: 'G#m', baseFret: 4, frets: [4, 6, 6, 4, 4, 4], barre: { fret: 4, fromString: 0, toString: 5 } },
  { name: 'A#m', baseFret: 1, frets: [null, 1, 3, 3, 2, 1], barre: { fret: 1, fromString: 1, toString: 5 } },
];

function findShape(name: string): ChordShape {
  const shape = CHORD_LIBRARY.find((candidate) => candidate.name === name);
  if (!shape) throw new Error(`Missing chord shape for "${name}"`);
  return shape;
}

/** Practical major-triad shape for every chromatic root, used to approximate transposed chords */
export const MAJOR_SHAPE_BY_ROOT: Readonly<Record<string, ChordShape>> = Object.fromEntries(
  NOTE_SEQUENCE.map((root) => [root, findShape(root)])
);

/** Practical minor-triad shape for every chromatic root, used to approximate transposed chords */
export const MINOR_SHAPE_BY_ROOT: Readonly<Record<string, ChordShape>> = Object.fromEntries(
  NOTE_SEQUENCE.map((root) => [root, findShape(`${root}m`)])
);

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