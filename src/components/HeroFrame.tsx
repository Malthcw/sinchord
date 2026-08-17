import { colors, spacing } from "@/constants/theme";
import { Image, type ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type HeroFrameProps = {
  source?: ImageSource | number;
  children: ReactNode;
};

export function HeroFrame({ source, children }: HeroFrameProps) {
  return (
    <View style={styles.card}>
      {source && (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
        />
      )}
      <LinearGradient
        colors={[
          "rgba(12,11,10,0.10)",
          "rgba(12,11,10,0.70)",
          "rgba(12,11,10,0.96)",
        ]}
        locations={[0, 0.5, 0.85]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: 330,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.lg,
  },
});
