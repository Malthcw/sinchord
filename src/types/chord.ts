export type ChordShape = {
  name: string;
  /**
   * One entry per string, low E to high E.
   * null = don't play, 0 = open, 1+ = fret number.
   */
  frets: readonly (number | null)[];
  /** Lowest fret shown in the diagram. 1 means the nut is visible. */
  baseFret: number;
  barre?: {
    fret: number;
    /** String indexes, 0 = low E */
    fromString: number;
    toString: number;
  };
};
