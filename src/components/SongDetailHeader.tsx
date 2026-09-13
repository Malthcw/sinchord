import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '@/constants/theme';

type SongDetailHeaderProps = {
  title: string;
  subtitle: string;
  isSaved: boolean;
  onBack: () => void;
  onToggleSave: () => void;
};

export function SongDetailHeader({ title, subtitle, isSaved, onBack, onToggleSave }: SongDetailHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={colors.text} />
      </Pressable>

      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
      </View>

      <Pressable
        onPress={onToggleSave}
        accessibilityRole="button"
        accessibilityLabel={isSaved ? 'Remove from saved' : 'Save song'}
        hitSlop={8}
        style={styles.saveButton}
      >
        <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={isSaved ? colors.accent : colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
