import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { setAuthTokenProvider } from '@/api/client';
import { authService } from '@/services/authService';
import type { AuthSession, AuthUser } from '@/types/auth';

const TOKEN_KEY = 'newzy-auth-token-v1';
const USER_KEY = 'newzy-auth-user-v1';

interface AuthState {
  status: 'hydrating' | 'anonymous' | 'authenticated';
  user: AuthUser | null;
  token: string | null;
  hydrate: () => Promise<void>;
  signIn: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
}

// Register the token provider once — the client attaches it to every request.
setAuthTokenProvider(() => useAuthStore.getState().token);

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'hydrating',
  user: null,
  token: null,

  hydrate: async () => {
    try {
      const [token, userJson] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      if (token && userJson) {
        set({ token, user: JSON.parse(userJson) as AuthUser, status: 'authenticated' });
      } else {
        set({ status: 'anonymous' });
      }
    } catch {
      set({ status: 'anonymous' });
    }
  },

  signIn: async (session) => {
    await SecureStore.setItemAsync(TOKEN_KEY, session.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user));
    set({ token: session.token, user: session.user, status: 'authenticated' });
  },

  signOut: async () => {
    try { await authService.logout(); } catch { /* session may already be gone */ }
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
    await SecureStore.deleteItemAsync(USER_KEY).catch(() => undefined);
    set({ token: null, user: null, status: 'anonymous' });
  },
}));
