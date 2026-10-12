import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ThemeMode } from '@/theme/tokens';

interface PreferencesState {
  themeMode: ThemeMode;
  recentSearches: string[];
  hasOnboarded: boolean;
  hasHydrated: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setHasOnboarded: (value: boolean) => void;
  setHasHydrated: (value: boolean) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  resetOnboarding: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      recentSearches: [],
      hasOnboarded: false,
      hasHydrated: false,
      setThemeMode: (mode) => set({ themeMode: mode }),
      setHasOnboarded: (value) => set({ hasOnboarded: value }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      addRecentSearch: (query) =>
        set((state) => ({
          recentSearches: [query, ...state.recentSearches.filter((q) => q !== query)].slice(0, 8),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),
      resetOnboarding: () => set({ hasOnboarded: false }),
    }),
    {
      name: 'newzy-preferences-v1',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
