import { apiClient } from '@/api/client';
import type { Article, ArticleDetail, NewsCategory, Paginated } from '@/types';

export type NewsListParams = { category?: NewsCategory; tag?: string; page?: number; pageSize?: number; };

/**
 * News consumption only — collection, normalization, dedup, validation,
 * classification, AI processing and admin review all happen in the backend
 * News Engine. Every response contains only `published` items.
 */
export const newsService = {
  list: (params: NewsListParams = {}): Promise<Paginated<Article>> => apiClient.get('/news', { params }),
  featured: (): Promise<Article[]> => apiClient.get('/news/featured'),
  breaking: (): Promise<Article[]> => apiClient.get('/news/breaking'),
  trending: (): Promise<Article[]> => apiClient.get('/news/trending'),
  byId: (id: string): Promise<ArticleDetail> => apiClient.get(`/news/${encodeURIComponent(id)}`),
};
