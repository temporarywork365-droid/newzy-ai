import { apiClient } from '@/api/client';
import type { SavedItem, SavedItemResolved } from '@/types';

/**
 * Saved items live locally (offline-first). This endpoint resolves the raw
 * {id, type} pairs into displayable rows — the same call the backend will serve.
 */
export const savedService = {
  resolve: (items: SavedItem[]): Promise<SavedItemResolved[]> =>
    apiClient.post('/saved/resolve', { items }),
};
