import { StyleSheet, Text, View } from 'react-native';
import type { Song } from '@/types/song';
import { colors, fonts, spacing } from '@/constants/theme';
import { transposeChordName } from '@/utils/chordTranspose';

type SongStatsRowProps = {
  song: Song;
  steps: number;
};

export function SongStatsRow({ song, steps }: SongStatsRowProps) {
  const newCapo = (song.capo ?? 0) + steps;

  const stats = [
    { label: 'KEY', value: transposeChordName(song.key, steps) },
    { label: 'CAPO', value: newCapo > 0 ? `Fret ${newCapo}` : 'None' },
    { label: 'TEMPO', value: String(song.tempo) },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.chip}>
          <Text style={styles.label}>{stat.label}</Text>
          <Text style={styles.value}>{stat.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 4,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: colors.textMuted,
  },
  value: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});
