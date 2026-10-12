import type { Article, Topic } from '@/types';
import type { InterestKey, InterestSignal } from '@/types/personalization';

/**
 * Modular recommendation engine — PURE functions, zero UI or store imports.
 *
 * Today: rule-based scoring over already-fetched content (client-side).
 * Later: replace `personalizeArticles` with a backend call
 * (`GET /feed/for-you?interests=…`) — every consumer keeps the same signature.
 */

const ALL_NEWS_CATEGORIES = [
  'ai-models', 'ai-tools', 'research', 'companies', 'startups',
  'ai-agents', 'robotics', 'ai-coding', 'ai-video', 'ai-image',
  'ai-audio', 'automation', 'regulation', 'industry', 'india-ai',
] as const;

export const INTEREST_SIGNALS: Record<InterestKey, InterestSignal> = {
  'ai-news': { newsCategories: [...ALL_NEWS_CATEGORIES], topicIds: [], tags: [] },
  'ai-agents': {
    newsCategories: ['ai-agents'],
    topicIds: ['ai-agents'],
    tags: ['agents', 'autonomy', 'agentic', 'mcp'],
  },
  'ai-coding': {
    newsCategories: ['ai-coding'],
    topicIds: ['ai-coding'],
    tags: ['coding', 'ide', 'tools'],
  },
  'ai-video': { newsCategories: ['ai-video'], topicIds: [], tags: ['video', 'filmmaking', 'creative'] },
  'ai-image': { newsCategories: ['ai-image'], topicIds: [], tags: ['image', 'editing', 'creative'] },
  'prompt-engineering': {
    newsCategories: [],
    topicIds: ['prompt-engineering'],
    tags: ['prompting', 'prompts', 'rag'],
  },
  'ai-research': { newsCategories: ['research'], topicIds: [], tags: ['research', 'reasoning', 'scaling'] },
  'automation': { newsCategories: ['automation'], topicIds: [], tags: ['automation', 'no-code', 'workflows'] },
};

/** Score one article against the user's interests (higher = more relevant). */
export function scoreArticle(article: Article, interests: InterestKey[]): number {
  let score = 0;
  const tagSet = new Set(article.tags.map((tag) => tag.toLowerCase()));
  for (const interest of interests) {
    const signal = INTEREST_SIGNALS[interest];
    if (signal.newsCategories.includes(article.category)) score += 2;
    for (const tag of signal.tags) {
      if (tagSet.has(tag)) score += 1;
    }
  }
  return score;
}

/** Top-N articles for the user, ranked by interest score, newest as tie-break. */
export function personalizeArticles(articles: Article[], interests: InterestKey[], limit = 5): Article[] {
  if (interests.length === 0 || articles.length === 0) return [];
  return articles
    .map((article) => ({ article, score: scoreArticle(article, interests) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.article.publishedAt.localeCompare(a.article.publishedAt))
    .slice(0, limit)
    .map((entry) => entry.article);
}

/** Top-N topic pages for the user (reserved for future rails). */
export function personalizeTopics(topics: Topic[], interests: InterestKey[], limit = 4): Topic[] {
  if (interests.length === 0 || topics.length === 0) return [];
  return topics
    .map((topic) => {
      let score = 0;
      const tagSet = new Set(topic.tags.map((tag) => tag.toLowerCase()));
      for (const interest of interests) {
        const signal = INTEREST_SIGNALS[interest];
        if (signal.topicIds.includes(topic.id)) score += 2;
        for (const tag of signal.tags) {
          if (tagSet.has(tag)) score += 1;
        }
      }
      return { topic, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.topic);
}
