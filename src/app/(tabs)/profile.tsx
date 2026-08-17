import { StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { colors, fonts, spacing } from '@/constants/theme';

export default function ProfileScreen() {
  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Account settings go here.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
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
  },
});
