import { CHORD_LIBRARY, MAJOR_SHAPE_BY_ROOT, MINOR_SHAPE_BY_ROOT } from '@/data/chords';
import type { ChordShape } from '@/types/chord';
import { parseChordName, transposeChordName, transposeNote } from '@/utils/chordTranspose';

/**
 * Resolves the shape to draw for `name` after shifting it by `steps` semitones.
 * At steps === 0 this is just the chord's own authored shape. Otherwise it
 * first looks for an exact match on the transposed name (e.g. transposing
 * "D" up 2 lands on the authored "E" shape), and falls back to the nearest
 * major/minor triad shape for the new root — so chords whose quality isn't
 * covered by the full chromatic set (m7, sus4, slash, ...) still get a
 * correctly-labeled, playable diagram instead of nothing.
 */
export function getTransposedShape(name: string, steps: number): ChordShape | undefined {
  const original = CHORD_LIBRARY.find((shape) => shape.name === name);
  if (steps === 0) return original;

  const transposedName = transposeChordName(name, steps);
  const exact = CHORD_LIBRARY.find((shape) => shape.name === transposedName);
  if (exact) return exact;

  const parsed = parseChordName(name);
  if (!parsed) return undefined;

  const newRoot = transposeNote(parsed.root, steps);
  const isMinor = parsed.quality.startsWith('m') && !parsed.quality.startsWith('maj');
  const fallback = (isMinor ? MINOR_SHAPE_BY_ROOT : MAJOR_SHAPE_BY_ROOT)[newRoot];
  if (!fallback) return undefined;

  return { ...fallback, name: transposedName };
}
