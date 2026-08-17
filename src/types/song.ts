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
  artworkUrl: string;
};

export type ContinueSession = {
  song: Song;
  /** How far through the song the user got, from 0 to 1 */
  progress: number;
};
