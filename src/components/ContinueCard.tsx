import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HeroFrame } from '@/components/HeroFrame';
import type { ContinueSession } from '@/types/song';
import { colors, fonts, spacing } from '@/constants/theme';

type ContinueCardProps = {
  session: ContinueSession;
  onPressPlay: () => void;
};

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

export function ContinueCard({ session, onPressPlay }: ContinueCardProps) {
  const { song, progress } = session;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const percent = Math.round(clamped * 100);

  return (
    <HeroFrame source={song.artworkUrl}>
      <Text style={styles.eyebrow}>PICK UP WHERE YOU LEFT OFF</Text>
      <Text style={styles.title} numberOfLines={2}>{song.title}</Text>
      <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>

      <View style={styles.progressRow}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${percent}%` }]} />
        </View>
        <Text style={styles.percent}>{percent}%</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.metaRow}>
          <MetaItem label="KEY" value={song.key} />
          <MetaItem label="CAPO" value={song.capo === null ? 'None' : `Fret ${song.capo}`} />
          <MetaItem label="TEMPO" value={String(song.tempo)} />
        </View>

        <Pressable
          onPress={onPressPlay}
          accessibilityRole="button"
          accessibilityLabel={`Play along to ${song.title}`}
          style={({ pressed }) => [styles.playButton, pressed && styles.playButtonPressed]}
        >
          <Ionicons name="play" size={16} color={colors.background} />
          <Text style={styles.playLabel}>Play along</Text>
        </Pressable>
      </View>
    </HeroFrame>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: colors.text,
  },
  artist: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(243, 239, 232, 0.15)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  percent: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    minWidth: 34,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metaItem: {
    gap: 2,
  },
  metaLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  metaValue: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 24,
  },
  playButtonPressed: {
    opacity: 0.85,
  },
  playLabel: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.background,
  },
});