import type { ContinueSession } from "@/types/song";

export const MOCK_SESSION: ContinueSession = {
  progress: 0.64,
  song: {
    id: "riverstone",
    title: "Riverstone",
    artist: "Hana Moss",
    key: "G",
    capo: null,
    tempo: 92,
    durationSeconds: 228,
    artworkUrl:
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800",
  },
};

export function useContinueSession(): ContinueSession | null {
  // Return MOCK_SESSION to preview the continue card.
  return null;
}
