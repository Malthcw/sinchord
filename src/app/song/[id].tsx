import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { SongDetailHeader } from '@/components/SongDetailHeader';
import { SongHeroCard } from '@/components/SongHeroCard';
import { SongStatsRow } from '@/components/SongStatsRow';
import { ChordsSection } from '@/components/ChordsSection';
import { StrummingCard } from '@/components/StrummingCard';
import { LyricsSection } from '@/components/LyricsSection';
import { SongsLoadState } from '@/components/SongsLoadState';
import { colors, fonts, spacing } from '@/constants/theme';
import { transposeChordName } from '@/utils/chordTranspose';
import { useSavedSongs } from '@/context/savedSongs';
import { useSongs } from '@/context/songs';

const MIN_TRANSPOSE = -6;
const MAX_TRANSPOSE = 6;

export default function SongDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isSaved, toggleSaved } = useSavedSongs();
  const { getSongById, status, errorMessage, refresh } = useSongs();
  const [transposeSteps, setTransposeSteps] = useState(0);

  const song = getSongById(id);

  if (!song) {
    const notReady = status !== 'ready';

    return (
      <Screen style={styles.notFound}>
        <SongDetailHeader
          title={notReady ? 'Loading song' : 'Song not found'}
          subtitle=""
          isSaved={false}
          onBack={() => router.back()}
          onToggleSave={() => {}}
        />
        {notReady ? (
          <SongsLoadState status={status} errorMessage={errorMessage} onRetry={() => void refresh()} />
        ) : (
          <Text style={styles.notFoundText}>This song doesn't exist anymore.</Text>
        )}
      </Screen>
    );
  }

  return (
    <Screen>
      <SongDetailHeader
        title={song.title}
        subtitle={`${song.artist} · ${transposeChordName(song.key, transposeSteps)}`}
        isSaved={isSaved(song.id)}
        onBack={() => router.back()}
        onToggleSave={() => toggleSaved(song.id)}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SongHeroCard song={song} />
        <SongStatsRow song={song} steps={transposeSteps} />
        <ChordsSection
          chordNames={song.chords}
          steps={transposeSteps}
          onDecrement={() => setTransposeSteps((value) => Math.max(value - 1, MIN_TRANSPOSE))}
          onIncrement={() => setTransposeSteps((value) => Math.min(value + 1, MAX_TRANSPOSE))}
        />
        <StrummingCard
          pattern={song.strumPattern}
          timeSignature={song.timeSignature}
          tempo={song.tempo}
          note={song.strummingNote}
        />
        {Array.isArray(song.lyrics) && song.lyrics.length > 0 && (
          <LyricsSection songTitle={song.title} sections={song.lyrics} steps={transposeSteps} />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  notFound: {
    paddingHorizontal: spacing.lg,
  },
  notFoundText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },
});
