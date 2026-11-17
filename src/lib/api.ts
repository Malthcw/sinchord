import type { LyricSection, Song, SongDifficulty } from '@/types/song';

// Accepts the project URL with or without a trailing slash or "/rest/v1".
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** A row of the `songs` table as Supabase's REST API returns it. */
type SongRow = {
  slug: string;
  title: string;
  artist: string;
  key: string;
  capo: number | null;
  tempo: number;
  duration_seconds: number;
  artwork_url: string | null;
  difficulty: SongDifficulty;
  chords: string[];
  genres: string[];
  strum_pattern: ('D' | 'U' | '-')[];
  time_signature: string;
  strumming_note: string | null;
  lyrics: LyricSection[] | null;
};

function toSong(row: SongRow): Song {
  return {
    id: row.slug,
    title: row.title,
    artist: row.artist,
    key: row.key,
    capo: row.capo,
    tempo: row.tempo,
    durationSeconds: row.duration_seconds,
    artworkUrl: row.artwork_url ?? undefined,
    difficulty: row.difficulty,
    chords: row.chords,
    genres: row.genres,
    strumPattern: row.strum_pattern,
    timeSignature: row.time_signature,
    strummingNote: row.strumming_note ?? undefined,
    lyrics: row.lyrics ?? undefined,
  };
}

export async function fetchSongs(): Promise<Song[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('your-supabase-url')) {
    throw new Error('Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart Expo.');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/songs?select=*&order=title`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Couldn't load songs (server responded ${response.status}).`);
  }

  const rows: SongRow[] = await response.json();
  return rows.map(toSong);
}
