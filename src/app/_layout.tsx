import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/auth';
import { SavedSongsProvider } from '@/context/savedSongs';
import { SongsProvider } from '@/context/songs';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SongsProvider>
        <SavedSongsProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SavedSongsProvider>
      </SongsProvider>
    </AuthProvider>
  );
}
