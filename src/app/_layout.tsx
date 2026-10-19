import { useCallback, useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppSplash } from '@/components/app/AppSplash';
import { LiveNewsRefresher } from '@/components/app/LiveNewsRefresher';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { useAuthStore } from '@/store/authStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,   // 1 minute freshness
      gcTime: 5 * 60_000,  // 5 minutes in cache — instant back-navigation
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type SplashPhase = 'visible' | 'fading' | 'gone';

function RootGate() {
  const { colors, scheme } = useTheme();
  const hasHydrated = usePreferencesStore((s) => s.hasHydrated);
  const hasOnboarded = usePreferencesStore((s) => s.hasOnboarded);
  const [splashPhase, setSplashPhase] = useState<SplashPhase>('visible');

  // Restore the session (SecureStore) in parallel with the splash.
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    const timer = setTimeout(() => setSplashPhase('fading'), 900);
    return () => clearTimeout(timer);
  }, [hasHydrated]);

  const finishSplash = useCallback(() => {
    SplashScreen.hideAsync().catch(() => undefined);
    setSplashPhase('gone');
  }, []);

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {splashPhase !== 'gone' ? (
        <AppSplash fading={splashPhase === 'fading'} onAnimationEnd={finishSplash} />
      ) : !hasOnboarded ? (
        <OnboardingScreen onComplete={() => usePreferencesStore.getState().setHasOnboarded(true)} />
      ) : (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <LiveNewsRefresher />
          <ThemeProvider>
            <RootGate />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
