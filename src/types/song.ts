export type SongDifficulty = 'Easy' | 'Beginner' | 'Intermediate' | 'Advanced';

/** One chunk of a lyric line, with the chord that starts over it (if any) */
export type LyricSegment = {
  chord?: string;
  text: string;
};

export type LyricSection = {
  label: string;
  lines: LyricSegment[][];
};

export type Song  = {
  id: string;
  title: string;
  artist: string;
  /** Musical key, e.g. "G", "Am", "F#m" */
  key: string;
  /** Fret number for the capo, or null when the song needs none */
  capo: number | null;
  /** Beats per minute */
  tempo: number;
  durationSeconds: number;
  /** When missing, show a colored initial in place of artwork */
  artworkUrl?: string;
  difficulty: SongDifficulty;
  /** Chord shapes used in the song, in the order they're introduced */
  chords: string[];
  genres: string[];
  /** 8 eighth-note strums for one bar of 4/4 time */
  strumPattern: ('D' | 'U' | '-')[];
  timeSignature: string;
  /** Short tip shown under the strumming pattern */
  strummingNote?: string;
  lyrics?: LyricSection[];
};

export type ContinueSession = {
  song: Song;
  /** How far through the song the user got, from 0 to 1 */
  progress: number;
};
