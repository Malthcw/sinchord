import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { SongListItem } from '@/components/SongListItem';
import { SongsLoadState } from '@/components/SongsLoadState';
import { colors, fonts, spacing } from '@/constants/theme';
import { useSavedSongs } from '@/context/savedSongs';
import { useSongs } from '@/context/songs';
import type { Song } from '@/types/song';

export default function SavedScreen() {
  const router = useRouter();
  const { savedIds } = useSavedSongs();
  const { songs: allSongs, status, errorMessage, refresh } = useSongs();

  const songs = useMemo(
    () => allSongs.filter((song) => savedIds.has(song.id)),
    [allSongs, savedIds]
  );

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
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Saved</Text>
            <Text style={styles.subtitle}>Songs you've saved will show up here.</Text>
          </View>
        }
        ListEmptyComponent={
          status === 'ready' ? (
            <Text style={styles.emptyText}>Tap the bookmark on any song to save it here.</Text>
          ) : (
            <SongsLoadState
              status={status}
              errorMessage={errorMessage}
              onRetry={() => void refresh()}
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },
});
