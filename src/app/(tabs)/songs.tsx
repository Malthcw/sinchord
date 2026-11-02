import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { SongSearchBar } from '@/components/SongSearchBar';
import { GenreFilterRow } from '@/components/GenreFilterRow';
import { SongListItem } from '@/components/SongListItem';
import { SongsLoadState } from '@/components/SongsLoadState';
import { useSongs } from '@/context/songs';
import { colors, fonts, spacing } from '@/constants/theme';
import type { Song } from '@/types/song';

export default function SongsScreen() {
  const router = useRouter();
  const { songs: allSongs, genres, status, errorMessage, refresh } = useSongs();
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All');

  const songs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allSongs.filter((song) => {
      const matchesGenre = genre === 'All' || song.genres.includes(genre);
      if (!matchesGenre) return false;

      if (normalizedQuery === '') return true;
      const haystack = [song.title, song.artist, ...song.chords].join(' ').toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [allSongs, query, genre]);

  return (
    <Screen>
      <FlatList<Song>
        data={songs}
        keyExtractor={(song) => song.id}
        renderItem={({ item }) => (
          <SongListItem song={item} onPress={() => router.push(`/song/${item.id}`)} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={status === 'loading' && allSongs.length > 0}
            onRefresh={() => void refresh()}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          status === 'ready' ? null : (
            <SongsLoadState
              status={status}
              errorMessage={errorMessage}
              onRetry={() => void refresh()}
            />
          )
        }
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Songs</Text>
            <Text style={styles.subtitle}>Search by title, artist, or a chord you already play.</Text>

            <SongSearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Riverstone, Ada Reyes, Em7..."
            />

            <View style={styles.filterRow}>
              <GenreFilterRow genres={genres} selected={genre} onSelect={setGenre} />
            </View>

            {status === 'ready' && <Text style={styles.count}>{songs.length} SONGS</Text>}
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  filterRow: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  count: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
});
