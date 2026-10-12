import { apiClient } from '@/api/client';
import type { AgentLesson, AgentLessonDetail, AgentProfile, Autonomy } from '@/types';

export type AgentListParams = { autonomy?: Autonomy | 'all'; };

export const agentService = {
  list: (params: AgentListParams = {}): Promise<AgentProfile[]> => apiClient.get('/agents', { params }),
  byId: (id: string): Promise<AgentProfile> => apiClient.get(`/agents/${encodeURIComponent(id)}`),
  lessons: (): Promise<AgentLesson[]> => apiClient.get('/agent-lessons'),
  lessonById: (id: string): Promise<AgentLessonDetail> => apiClient.get(`/agent-lessons/${encodeURIComponent(id)}`),
};
