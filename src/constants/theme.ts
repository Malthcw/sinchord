/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const colors = {
  background: "#0C0B0A",
  surface: "#17161A",
  surfaceRaised: "#1F1E22",
  border: "#2B2A2F",
  text: "#F3EFE8",
  textMuted: "#8B8A90",
  accent: "#E9A33C",
  accentSoft: "rgba(233, 163, 60, 0.12)",
} as const;

export const fonts = {
  // Placeholder faces — we'll swap in a real display font later.
  display: Platform.select({
    ios: "Georgia",
    android: "serif",
    default: "serif",
  }),
  body: Platform.select({
    ios: "System",
    android: "sans-serif",
    default: "System",
  }),
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
