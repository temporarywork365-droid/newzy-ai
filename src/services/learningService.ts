import { apiClient } from '@/api/client';
import type { Concept, ConceptDetail, LearningTrack, Level } from '@/types';

export type ConceptListParams = {
  level?: Level | 'all';
  track?: LearningTrack | 'all';
};

export const learningService = {
  list: (params: ConceptListParams = {}): Promise<Concept[]> => apiClient.get('/concepts', { params }),
  featured: (): Promise<Concept[]> => apiClient.get('/concepts/featured'),
  byId: (id: string): Promise<ConceptDetail> => apiClient.get(`/concepts/${encodeURIComponent(id)}`),
};
