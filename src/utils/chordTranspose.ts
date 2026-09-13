export const NOTE_SEQUENCE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const FLAT_TO_SHARP: Record<string, string> = {
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
};

const ROOT_PATTERN = /^([A-G][#b]?)(.*)$/;

export function transposeNote(note: string, steps: number): string {
  const normalized = FLAT_TO_SHARP[note] ?? note;
  const index = NOTE_SEQUENCE.indexOf(normalized);
  if (index === -1) return note;

  const shifted = ((index + steps) % 12 + 12) % 12;
  return NOTE_SEQUENCE[shifted];
}

export type ParsedChordName = {
  root: string;
  quality: string;
  bass?: string;
};

/** Splits a chord name into its root, quality suffix, and optional slash bass note */
export function parseChordName(name: string): ParsedChordName | undefined {
  const [main, bass] = name.split('/');
  const mainMatch = main.match(ROOT_PATTERN);
  if (!mainMatch) return undefined;

  const [, root, quality] = mainMatch;
  if (!bass) return { root, quality };

  const bassMatch = bass.match(ROOT_PATTERN);
  return { root, quality, bass: bassMatch ? bassMatch[1] : bass };
}

/** Shifts a chord name by `steps` semitones, e.g. transposeChordName('D/F#', 2) -> 'E/G#' */
export function transposeChordName(name: string, steps: number): string {
  if (steps === 0) return name;

  const parsed = parseChordName(name);
  if (!parsed) return name;

  let result = transposeNote(parsed.root, steps) + parsed.quality;
  if (parsed.bass) {
    result += `/${transposeNote(parsed.bass, steps)}`;
  }

  return result;
}
