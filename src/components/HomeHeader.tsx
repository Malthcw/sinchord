import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '@/constants/theme';

type HomeHeaderProps = {
  dateLabel: string;
  greeting: string;
  onPressSearch: () => void;
};

export function HomeHeader({ dateLabel, greeting, onPressSearch }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.date}>{dateLabel}</Text>
        <Text style={styles.greeting}>{greeting}</Text>
      </View>

      <Pressable
        onPress={onPressSearch}
        accessibilityRole="button"
        accessibilityLabel="Search songs"
        hitSlop={8}
        style={({ pressed }) => [styles.searchButton, pressed && styles.searchButtonPressed]}
      >
        <Ionicons name="search" size={20} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  textBlock: {
    flex: 1,
    paddingRight: spacing.md,
  },
  date: {
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 1.6,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  greeting: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    color: colors.text,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchButtonPressed: {
    backgroundColor: colors.surfaceRaised,
  },
});