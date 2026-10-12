import { apiClient } from '@/api/client';
import type { SearchResponse, SearchSuggestion } from '@/types/search';

/**
 * The ONLY search gateway the app uses. When the backend upgrades to
 * semantic/vector search, the response shape stays identical (engine + score
 * fields are already in the contract) — this file is the single place to add
 * parameters like `mode: 'semantic'` or a session id later.
 */
export const searchService = {
  query: (q: string): Promise<SearchResponse> =>
    apiClient.get('/search', { params: { q } }),

  suggest: (q: string): Promise<SearchSuggestion[]> =>
    apiClient.get('/search/suggest', { params: { q } }),
};
