import type { FilterOption } from '@/components/ui/FilterRow';
import { ENTITY_TYPE_LABELS } from '@/constants/taxonomy';
import type { EntityType, SearchResult, Topic } from '@/types';

/** Display order of result categories in search. */
export const SEARCH_TYPE_ORDER: EntityType[] = [
  'article', 'tutorial', 'model', 'tool', 'topic', 'company',
  'research', 'workflow', 'prompt', 'concept', 'agent', 'lesson',
];

export function filterResults(results: SearchResult[], category: 'all' | EntityType): SearchResult[] {
  return category === 'all' ? results : results.filter((result) => result.type === category);
}

export function groupResultsByType(results: SearchResult[]): [EntityType, SearchResult[]][] {
  if (results.length === 0) return [];
  const map = new Map<EntityType, SearchResult[]>();
  for (const result of results) {
    const list = map.get(result.type) ?? [];
    list.push(result);
    map.set(result.type, list);
  }
  return [...map.entries()].sort(
    (a, b) => SEARCH_TYPE_ORDER.indexOf(a[0]) - SEARCH_TYPE_ORDER.indexOf(b[0]),
  );
}

export function buildFilterOptions(results: SearchResult[]): FilterOption<'all' | EntityType>[] {
  const present = SEARCH_TYPE_ORDER.filter((type) => results.some((result) => result.type === type));
  return [
    { value: 'all', label: `All (${results.length})` },
    ...present.map((type) => ({ value: type, label: ENTITY_TYPE_LABELS[type] })),
  ];
}

/** Topic pages related to the current query (for the non-knowledge-card path). */
export function findRelatedTopics(query: string, topics: Topic[] | undefined, limit = 5): Topic[] {
  if (query.trim().length < 2 || !topics) return [];
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  return topics
    .filter((topic) => {
      const haystack = `${topic.name} ${topic.tagline} ${topic.tags.join(' ')}`.toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    })
    .slice(0, limit);
}
