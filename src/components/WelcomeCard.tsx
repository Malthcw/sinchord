import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HeroFrame } from '@/components/HeroFrame';
import { colors, fonts, spacing } from '@/constants/theme';

type WelcomeCardProps = {
  onPressBrowse: () => void;
};

export function WelcomeCard({ onPressBrowse }: WelcomeCardProps) {
  return (
    <HeroFrame>
      <Text style={styles.eyebrow}>WELCOME TO</Text>
      <Text style={styles.title}>SINCHORD</Text>
      <Text style={styles.blurb}>
        Chords and strumming patterns for Sinhala songs. Pick one and start playing.
      </Text>

      <Pressable
        onPress={onPressBrowse}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonLabel}>Browse songs</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.background} />
      </Pressable>
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
    fontSize: 38,
    letterSpacing: 1,
    color: colors.text,
  },
  blurb: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    marginTop: spacing.sm,
    maxWidth: 280,
  },
  button: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 24,
    marginTop: spacing.lg,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.background,
  },
});