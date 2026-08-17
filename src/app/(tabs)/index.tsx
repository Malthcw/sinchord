import { ContinueCard } from "@/components/ContinueCard";
import { HomeHeader } from "@/components/HomeHeader";
import { Screen } from "@/components/Screen";
import { WelcomeCard } from "@/components/WelcomeCard";
import { formatHeaderDate, getGreeting } from "@/constants/greeting";
import { colors, fonts, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { pickRandomChords } from "@/data/chords";
import { useContinueSession } from "@/hooks/useContinueSession";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { ChordMarquee } from '@/components/ChordMarquee';


export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const continueSession = useContinueSession();
  const chordStrip = useMemo(() => pickRandomChords(7), []);

  const { dateLabel, greeting } = useMemo(() => {
    const now = new Date();
    return {
      dateLabel: formatHeaderDate(now),
      greeting: getGreeting(user?.name ?? null, now),
    };
  }, [user?.name]);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader
          dateLabel={dateLabel}
          greeting={greeting}
          onPressSearch={() => {
            // Search screen comes later.
          }}
        />

        {continueSession === null ? (
          <WelcomeCard onPressBrowse={() => router.push("/songs")} />
        ) : (
          <ContinueCard
            session={continueSession}
            onPressPlay={() => {
              // Player screen comes later.
            }}
          />
        )}

        <ChordMarquee shapes={chordStrip} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xl,
  },
  placeholder: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  placeholderText: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 14,
  },
});
