import { apiClient } from '@/api/client';
import type { AuthCredentials, AuthSession, AuthUser } from '@/types/auth';

/**
 * Authentication runs entirely on the backend. The app sends credentials over
 * HTTPS and receives a session token — which is stored in SecureStore and
 * attached by the apiClient. No keys of any kind live in the client.
 */
export const authService = {
  login: (credentials: AuthCredentials): Promise<AuthSession> =>
    apiClient.post('/auth/login', credentials),

  register: (credentials: AuthCredentials): Promise<AuthSession> =>
    apiClient.post('/auth/register', credentials),

  logout: (): Promise<{ ok: boolean }> =>
    apiClient.post('/auth/logout'),

  me: (token: string): Promise<AuthUser> =>
    apiClient.get('/auth/me', { params: { token } }),
};
