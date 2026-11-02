import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type SavedSongsContextValue = {
  savedIds: Set<string>;
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;
};

const SavedSongsContext = createContext<SavedSongsContextValue | undefined>(undefined);

export function SavedSongsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  const toggleSaved = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const value = useMemo<SavedSongsContextValue>(
    () => ({ savedIds, isSaved, toggleSaved }),
    [savedIds, isSaved, toggleSaved]
  );

  return <SavedSongsContext.Provider value={value}>{children}</SavedSongsContext.Provider>;
}

export function useSavedSongs(): SavedSongsContextValue {
  const context = useContext(SavedSongsContext);
  if (context === undefined) {
    throw new Error('useSavedSongs must be used inside a <SavedSongsProvider>');
  }
  return context;
}
