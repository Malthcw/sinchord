import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { Song } from '@/types/song';
import { colors, fonts, spacing } from '@/constants/theme';
import { avatarColorFor, formatDuration } from '@/utils/songFormat';

type SongHeroCardProps = {
  song: Song;
};

export function SongHeroCard({ song }: SongHeroCardProps) {
  const meta = [song.genres[0], song.difficulty, formatDuration(song.durationSeconds)]
    .filter(Boolean)
    .join(' · ')
    .toUpperCase();

  return (
    <View style={styles.container}>
      {song.artworkUrl ? (
        <Image source={{ uri: song.artworkUrl }} style={styles.art} contentFit="cover" />
      ) : (
        <View style={[styles.art, styles.avatar, { backgroundColor: avatarColorFor(song.id) }]}>
          <Text style={styles.avatarLetter}>{song.title.charAt(0).toUpperCase()}</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title}>{song.title}</Text>
        <Text style={styles.artist}>{song.artist}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  art: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.text,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
  },
  artist: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.textMuted,
    marginTop: 2,
  },
});
