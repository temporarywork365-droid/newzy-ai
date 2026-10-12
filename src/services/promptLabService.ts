import { apiClient } from '@/api/client';
import type { PromptLabCategory, PromptLabResult } from '@/types/promptLab';

/**
 * Analysis runs on the backend — the real deployment makes a server-side LLM
 * call with the backend's own keys. The client posts only { input, category }
 * and renders the typed result. No keys ever live in the app.
 */
export const promptLabService = {
  analyze: (input: string, category?: PromptLabCategory): Promise<PromptLabResult> =>
    apiClient.post('/prompt-lab/analyze', { input, category }),
};
