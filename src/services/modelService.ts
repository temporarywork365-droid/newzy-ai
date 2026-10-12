import { apiClient } from '@/api/client';
import type { AIModel, ModelCategory, ModelDetail, Modality } from '@/types';

export type ModelListParams = {
  modality?: Modality | 'all';
  category?: ModelCategory | 'all';
  q?: string;
};

export const modelService = {
  list: (params: ModelListParams = {}): Promise<AIModel[]> => apiClient.get('/models', { params }),
  trending: (): Promise<AIModel[]> => apiClient.get('/models/trending'),
  byId: (id: string): Promise<ModelDetail> => apiClient.get(`/models/${encodeURIComponent(id)}`),
};
