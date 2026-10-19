import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ThemeMode } from '@/theme/tokens';
import type { AppLanguage } from '@/utils/localize';

interface PreferencesState {
  themeMode: ThemeMode;
  language: AppLanguage;
  recentSearches: string[];
  hasOnboarded: boolean;
  hasHydrated: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: AppLanguage) => void;
  setHasOnboarded: (value: boolean) => void;
  setHasHydrated: (value: boolean) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  resetOnboarding: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      themeMode: 'dark',
      language: 'en',
      recentSearches: [],
      hasOnboarded: false,
      hasHydrated: false,
      setThemeMode: (mode) => set({ themeMode: mode }),
      setLanguage: (language) => set({ language }),
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
      // Version 2 switched the app to the black theme. Phones that saved an older version are moved to it once;
      // people can still change the theme in Settings afterwards.
      version: 2,
      migrate: (persisted, version) => {
        const saved = (persisted ?? {}) as Partial<PreferencesState>;
        return (version < 2 ? { ...saved, themeMode: 'dark' } : saved) as PreferencesState;
      },
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
