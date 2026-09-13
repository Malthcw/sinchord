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
import { SONGS } from '@/data/songs';
import { colors, fonts, spacing } from '@/constants/theme';
import { transposeChordName } from '@/utils/chordTranspose';

const MIN_TRANSPOSE = -6;
const MAX_TRANSPOSE = 6;

export default function SongDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [transposeSteps, setTransposeSteps] = useState(0);

  const song = SONGS.find((candidate) => candidate.id === id);

  if (!song) {
    return (
      <Screen style={styles.notFound}>
        <SongDetailHeader
          title="Song not found"
          subtitle=""
          isSaved={false}
          onBack={() => router.back()}
          onToggleSave={() => {}}
        />
        <Text style={styles.notFoundText}>This song doesn't exist anymore.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <SongDetailHeader
        title={song.title}
        subtitle={`${song.artist} · ${transposeChordName(song.key, transposeSteps)}`}
        isSaved={isSaved}
        onBack={() => router.back()}
        onToggleSave={() => setIsSaved((value) => !value)}
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
        {song.lyrics && (
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
