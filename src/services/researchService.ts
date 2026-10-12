import { apiClient } from '@/api/client';
import type { ResearchPaper } from '@/types';

export const researchService = {
  list: (): Promise<ResearchPaper[]> => apiClient.get('/research'),
  byId: (id: string): Promise<ResearchPaper> => apiClient.get(`/research/${encodeURIComponent(id)}`),
};
