import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchSongs } from '@/lib/api';
import type { Song } from '@/types/song';

type SongsStatus = 'loading' | 'ready' | 'error';

type SongsContextValue = {
  songs: Song[];
  genres: string[];
  status: SongsStatus;
  errorMessage: string | null;
  refresh: () => Promise<void>;
  getSongById: (id: string) => Song | undefined;
};

const SongsContext = createContext<SongsContextValue | undefined>(undefined);

export function SongsProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [status, setStatus] = useState<SongsStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      setSongs(await fetchSongs());
      setErrorMessage(null);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Couldn't reach the song server.",
      );
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const genres = useMemo(
    () => ['All', ...Array.from(new Set(songs.flatMap((song) => song.genres))).sort()],
    [songs],
  );

  const getSongById = useCallback(
    (id: string) => songs.find((song) => song.id === id),
    [songs],
  );

  const value = useMemo<SongsContextValue>(
    () => ({ songs, genres, status, errorMessage, refresh, getSongById }),
    [songs, genres, status, errorMessage, refresh, getSongById],
  );

  return <SongsContext.Provider value={value}>{children}</SongsContext.Provider>;
}

export function useSongs(): SongsContextValue {
  const context = useContext(SongsContext);
  if (context === undefined) {
    throw new Error('useSongs must be used inside a <SongsProvider>');
  }
  return context;
}
