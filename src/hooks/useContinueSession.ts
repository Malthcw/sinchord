import type { ContinueSession, Song } from "@/types/song";

export function buildMockSession(song: Song): ContinueSession {
  return { progress: 0.64, song };
}

export function useContinueSession(): ContinueSession | null {
  // Return buildMockSession(song) to preview the continue card.
  return null;
}
