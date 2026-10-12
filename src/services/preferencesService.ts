import { apiClient } from '@/api/client';
import type { InterestKey } from '@/types/personalization';

export interface RemotePreferences {
  interests: InterestKey[];
}

/** Server-side user preferences (interests today; theme, language later). */
export const preferencesService = {
  load: (): Promise<RemotePreferences> => apiClient.get('/profile/preferences'),
  save: (preferences: RemotePreferences): Promise<RemotePreferences> =>
    apiClient.post('/profile/preferences', preferences),
};
