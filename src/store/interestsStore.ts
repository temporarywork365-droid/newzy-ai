import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { preferencesService } from '@/services/preferencesService';
import { useAuthStore } from '@/store/authStore';
import type { InterestKey } from '@/types/personalization';

interface InterestsState {
  interests: InterestKey[];
  hasHydrated: boolean;
  setInterests: (interests: InterestKey[]) => void;
  toggleInterest: (key: InterestKey) => void;
  clearInterests: () => void;
  setHasHydrated: (value: boolean) => void;
}

/** Best-effort server sync — local store stays the source of truth offline. */
const syncToBackend = (interests: InterestKey[]) => {
  if (useAuthStore.getState().status !== 'authenticated') return;
  preferencesService.save({ interests }).catch(() => undefined);
};

export const useInterestsStore = create<InterestsState>()(
  persist(
    (set) => ({
      interests: [],
      hasHydrated: false,
      setInterests: (interests) => {
        set({ interests });
        syncToBackend(interests);
      },
      toggleInterest: (key) =>
        set((state) => {
          const interests = state.interests.includes(key)
            ? state.interests.filter((item) => item !== key)
            : [...state.interests, key];
          syncToBackend(interests);
          return { interests };
        }),
      clearInterests: () => {
        set({ interests: [] });
        syncToBackend([]);
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'newzy-interests-v1',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
