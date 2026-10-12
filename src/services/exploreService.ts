import { apiClient } from '@/api/client';
import type { ExploreCounts } from '@/types';

export const exploreService = {
  overview: (): Promise<ExploreCounts> => apiClient.get('/explore/overview'),
};
