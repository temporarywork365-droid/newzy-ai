import { create } from 'zustand';

interface LiveStatusState {
  /** When the app last got fresh news from the server (null = never, e.g. offline or sample data). */
  updatedAt: number | null;
  markUpdated: (at?: number) => void;
}

export const useLiveStatusStore = create<LiveStatusState>((set) => ({
  updatedAt: null,
  markUpdated: (at = Date.now()) => set({ updatedAt: at }),
}));
