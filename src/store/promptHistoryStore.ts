import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { PromptHistoryItem } from '@/types/promptLab';

interface PromptHistoryState {
  items: PromptHistoryItem[]; // most recent first
  add: (item: PromptHistoryItem) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const usePromptHistoryStore = create<PromptHistoryState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((state) => ({
          items: [item, ...state.items.filter((entry) => entry.id !== item.id)].slice(0, 50),
        })),
      remove: (id) => set((state) => ({ items: state.items.filter((entry) => entry.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'newzy-prompt-history-v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
