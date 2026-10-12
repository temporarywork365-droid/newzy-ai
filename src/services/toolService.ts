import { apiClient } from '@/api/client';
import type { AITool, PricingModel, ToolCategory, ToolDetail } from '@/types';

export type ToolListParams = {
  category?: ToolCategory | 'all';
  pricing?: PricingModel | 'all';
  q?: string;
};

export const toolService = {
  list: (params: ToolListParams = {}): Promise<AITool[]> => apiClient.get('/tools', { params }),
  trending: (): Promise<AITool[]> => apiClient.get('/tools/trending'),
  byId: (id: string): Promise<ToolDetail> => apiClient.get(`/tools/${encodeURIComponent(id)}`),
};
