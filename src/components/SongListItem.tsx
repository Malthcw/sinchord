import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { Song } from '@/types/song';
import { colors, fonts, spacing } from '@/constants/theme';
import { avatarColorFor, formatDuration } from '@/utils/songFormat';

type SongListItemProps = {
  song: Song;
  onPress?: () => void;
};

export function SongListItem({ song, onPress }: SongListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      {song.artworkUrl ? (
        <Image source={{ uri: song.artworkUrl }} style={styles.thumbnail} contentFit="cover" />
      ) : (
        <View style={[styles.thumbnail, styles.avatar, { backgroundColor: avatarColorFor(song.id) }]}>
          <Text style={styles.avatarLetter}>{song.title.charAt(0).toUpperCase()}</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
        <Text style={styles.chords} numberOfLines={1}>{song.chords.join(' · ')}</Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.difficulty}>{song.difficulty.toUpperCase()}</Text>
        <Text style={styles.duration}>{formatDuration(song.durationSeconds)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  rowPressed: {
    opacity: 0.7,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  artist: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  chords: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  meta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  difficulty: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: colors.accent,
  },
  duration: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
});
