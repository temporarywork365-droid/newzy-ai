import { apiClient } from '@/api/client';
import type { PromptTemplate, Level } from '@/types';

export type PromptListParams = { level?: Level | 'all'; task?: string; };

export const promptService = {
  list: (params: PromptListParams = {}): Promise<PromptTemplate[]> => apiClient.get('/prompts', { params }),
  byId: (id: string): Promise<PromptTemplate> => apiClient.get(`/prompts/${encodeURIComponent(id)}`),
};
