import type { EntityType } from './index';

/** A single structured search result row. */
export interface SearchResult {
  type: EntityType;
  id: string;
  title: string;
  subtitle: string;
  route: string;
  tags: string[];
  /** Relevance score from the search engine (0–1). Populated by semantic engines later. */
  score?: number;
}

/** As-you-type suggestion row. */
export interface SearchSuggestion {
  text: string;
  hint: string; // e.g. 'Trending', 'Topic', 'Model', 'Tool', 'Term', 'Learn'
}

/**
 * Full search response. `engine` identifies the backend engine that produced it
 * (e.g. 'keyword-v1', later 'hybrid-v2' with vector search) — the client renders
 * any engine's output unchanged.
 */
export interface SearchResponse {
  query: string;
  engine: string;
  tookMs: number;
  results: SearchResult[];
  relatedQueries: string[];
  /** Populated when the engine detects a conceptual query (e.g. "What is RAG?"). */
  knowledge: KnowledgeCard | null;
}

/**
 * Knowledge card for conceptual queries — the "understand" layer of search.
 * Returned fully composed by the backend; the client only renders it.
 */
export interface KnowledgeCard {
  id: string;
  term: string;
  definition: string;
  simpleExplanation: string;
  detailedExplanation: string;
  example: string;
  realWorldUse: string;
  relatedTopicIds: string[];
  latestUpdates: SearchResult[];
  sources: { title: string; url: string }[];
  relatedSearches: string[];
}

/** Source record for the knowledge base (the database shape the engine reads). */
export interface KnowledgeEntry {
  id: string;
  term: string;
  aliases: string[];
  definition: string;
  simpleExplanation: string;
  detailedExplanation: string;
  example: string;
  realWorldUse: string;
  relatedTopicIds: string[];
  relatedArticleIds: string[];
  sources: { title: string; url: string }[];
  relatedSearches: string[];
  tags: string[];
}
