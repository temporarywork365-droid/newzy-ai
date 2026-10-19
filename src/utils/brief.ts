import type { Article } from '@/types';

/**
 * "Today's top 5": the most important stories of the last 48 hours.
 * Falls back to the newest stories when fewer than 3 are that fresh. Tutorials are not news, so they are skipped.
 */
export function pickTopStories(pool: Article[], max = 5, nowMs: number = Date.now()): Article[] {
  const news = pool.filter((article) => !article.tags.includes('tutorial'));
  const cutoff = nowMs - 48 * 3_600_000;
  const fresh = news.filter((article) => new Date(article.publishedAt).getTime() >= cutoff);
  const source = fresh.length >= 3 ? fresh : news;
  return [...source].sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0)).slice(0, max);
}
