import { apiClient } from '@/api/client';
import type { Topic, TopicDetail } from '@/types';

export const topicService = {
  list: (): Promise<Topic[]> => apiClient.get('/topics'),
  trending: (): Promise<Topic[]> => apiClient.get('/topics/trending'),
  byId: (id: string): Promise<TopicDetail> => apiClient.get(`/topics/${encodeURIComponent(id)}`),
};
