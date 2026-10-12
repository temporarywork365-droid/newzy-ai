import type { NewsCategory } from './index';

export type InterestKey =
  | 'ai-news' | 'ai-agents' | 'ai-coding' | 'ai-video'
  | 'ai-image' | 'prompt-engineering' | 'ai-research' | 'automation';

/** Content signals an interest maps to — consumed by the recommendation engine. */
export interface InterestSignal {
  newsCategories: NewsCategory[];
  topicIds: string[];
  tags: string[];
}
