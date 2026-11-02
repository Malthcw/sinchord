import type { Song } from '@/types/song';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function fetchSongs(): Promise<Song[]> {
  const response = await fetch(`${API_URL}/api/songs`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Couldn't load songs (server responded ${response.status}).`);
  }

  const body: { data: Song[] } = await response.json();
  return body.data;
}
