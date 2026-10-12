import { apiClient } from '@/api/client';
import type { Workflow, WorkflowDetail } from '@/types';

export const workflowService = {
  list: (): Promise<Workflow[]> => apiClient.get('/workflows'),
  byId: (id: string): Promise<WorkflowDetail> => apiClient.get(`/workflows/${encodeURIComponent(id)}`),
};
