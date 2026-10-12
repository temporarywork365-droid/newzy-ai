import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { EntityType, SavedItem } from '@/types';

interface SavedState {
  items: SavedItem[]; // most recent first
  isSaved: (id: string) => boolean;
  toggle: (id: string, type: EntityType) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      items: [],
      isSaved: (id) => get().items.some((item) => item.id === id),
      toggle: (id, type) =>
        set((state) => ({
          items: state.items.some((item) => item.id === id)
            ? state.items.filter((item) => item.id !== id)
            : [{ id, type, savedAt: Date.now() }, ...state.items],
        })),
      remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'newzy-saved-v1',
      storage: createJSONStorage(() => AsyncStorage),
      // No partialize needed: JSON.stringify drops the action functions automatically.
    },
  ),
);
