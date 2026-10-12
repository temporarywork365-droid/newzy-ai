import { apiClient } from '@/api/client';
import type { DailyDigest } from '@/types';

export const digestService = {
  today: (): Promise<DailyDigest> => apiClient.get('/digest/today'),
};
