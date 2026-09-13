import { StyleSheet, Text, View } from 'react-native';
import type { LyricSection, LyricSegment } from '@/types/song';
import { colors, fonts, spacing } from '@/constants/theme';
import { transposeChordName } from '@/utils/chordTranspose';

type LyricsSectionProps = {
  songTitle: string;
  sections: LyricSection[];
  steps: number;
};

function LyricLine({ segments, steps }: { segments: LyricSegment[]; steps: number }) {
  return (
    <View style={styles.lineRow}>
      {segments.map((segment, index) => (
        <View key={index} style={styles.segment}>
          <Text style={styles.chord}>{segment.chord ? transposeChordName(segment.chord, steps) : ' '}</Text>
          <Text style={styles.lyric}>{segment.text}</Text>
        </View>
      ))}
    </View>
  );
}

export function LyricsSection({ songTitle, sections, steps }: LyricsSectionProps) {
  return (
    <View style={styles.container}>
      {sections.map((section) => (
        <View key={section.label} style={styles.section}>
          <Text style={styles.sectionLabel}>{section.label}</Text>
          {section.lines.map((line, index) => (
            <LyricLine key={index} segments={line} steps={steps} />
          ))}
        </View>
      ))}

      <Text style={styles.footer}>End of {songTitle} · transcribed by the community</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
  },
  lineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  segment: {
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  chord: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 2,
  },
  lyric: {
    fontFamily: fonts.body,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
