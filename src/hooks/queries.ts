import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import {
  agentService, companyService, digestService, exploreService, learningService, modelService,
  newsService, promptLabService, promptService, researchService, savedService, searchService,
  toolService, topicService, workflowService,
} from '@/services';
import type {
  Autonomy, LearningTrack, Level, Modality, ModelCategory, NewsCategory,
  PricingModel, SavedItem, ToolCategory,
} from '@/types';
import type { PromptLabCategory } from '@/types/promptLab';

export const queryKeys = {
  newsFeed: (category?: NewsCategory) => ['news', 'feed', category ?? 'all'] as const,
  newsLatest: (category?: NewsCategory) => ['news', 'latest', category ?? 'all'] as const,
  newsFeatured: ['news', 'featured'] as const,
  newsBreaking: ['news', 'breaking'] as const,
  newsTrending: ['news', 'trending'] as const,
  newsPool: ['news', 'pool'] as const,
  article: (id: string) => ['news', 'article', id] as const,

  models: (modality: string, category: string, q: string) => ['models', modality, category, q] as const,
  modelTrending: ['models', 'trending'] as const,
  model: (id: string) => ['models', 'detail', id] as const,

  tools: (pricing: string, category: string, q: string) => ['tools', pricing, category, q] as const,
  toolsTrending: ['tools', 'trending'] as const,
  tool: (id: string) => ['tools', 'detail', id] as const,

  concepts: (filter: string) => ['concepts', filter] as const,
  conceptFeatured: ['concepts', 'featured'] as const,
  concept: (id: string) => ['concepts', 'detail', id] as const,

  prompts: (filter: string) => ['prompts', filter] as const,
  prompt: (id: string) => ['prompts', 'detail', id] as const,

  workflows: ['workflows'] as const,
  workflow: (id: string) => ['workflows', 'detail', id] as const,

  agents: (filter: string) => ['agents', filter] as const,
  agent: (id: string) => ['agents', 'detail', id] as const,
  agentLessons: ['agent-lessons'] as const,
  agentLesson: (id: string) => ['agent-lessons', 'detail', id] as const,

  research: ['research'] as const,
  researchPaper: (id: string) => ['research', 'detail', id] as const,

  companies: ['companies'] as const,
  company: (id: string) => ['companies', 'detail', id] as const,

  topics: ['topics'] as const,
  topicTrending: ['topics', 'trending'] as const,
  topic: (id: string) => ['topics', 'detail', id] as const,

  digest: ['digest', 'today'] as const,
  search: (q: string) => ['search', q] as const,
  searchSuggest: (q: string) => ['search', 'suggest', q] as const,
  exploreOverview: ['explore', 'overview'] as const,
  savedResolve: (signature: string) => ['saved', 'resolve', signature] as const,
};

/* ── News ─────────────────────────────────── */
export const useNewsFeed = (category?: NewsCategory) =>
  useInfiniteQuery({
    queryKey: queryKeys.newsFeed(category),
    queryFn: ({ pageParam }) => newsService.list({ category, page: pageParam, pageSize: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });

export const useLatestNews = (category?: NewsCategory) =>
  useQuery({
    queryKey: queryKeys.newsLatest(category),
    queryFn: () => newsService.list({ category, page: 1, pageSize: 6 }),
    select: (res) => res.items,
  });

export const useFeaturedNews = () =>
  useQuery({ queryKey: queryKeys.newsFeatured, queryFn: () => newsService.featured() });

export const useBreakingNews = () =>
  useQuery({ queryKey: queryKeys.newsBreaking, queryFn: () => newsService.breaking() });

export const useTrendingNews = () =>
  useQuery({ queryKey: queryKeys.newsTrending, queryFn: () => newsService.trending() });

/** Larger article pool consumed by the personalization engine. */
export const useForYouNews = () =>
  useQuery({
    queryKey: queryKeys.newsPool,
    queryFn: () => newsService.list({ page: 1, pageSize: 20 }),
    select: (res) => res.items,
  });

export const useArticle = (id: string) =>
  useQuery({ queryKey: queryKeys.article(id), queryFn: () => newsService.byId(id), enabled: !!id });

/* ── Digest ───────────────────────────────── */
export const useDailyDigest = () =>
  useQuery({ queryKey: queryKeys.digest, queryFn: () => digestService.today() });

/* ── Topics ───────────────────────────────── */
export const useTopics = () =>
  useQuery({ queryKey: queryKeys.topics, queryFn: () => topicService.list() });

export const useTrendingTopics = () =>
  useQuery({ queryKey: queryKeys.topicTrending, queryFn: () => topicService.trending() });

export const useTopic = (id: string) =>
  useQuery({ queryKey: queryKeys.topic(id), queryFn: () => topicService.byId(id), enabled: !!id });

/* ── Models ───────────────────────────────── */
export const useModels = (modality: Modality | 'all', category: ModelCategory | 'all' = 'all', q = '') =>
  useQuery({
    queryKey: queryKeys.models(modality, category, q),
    queryFn: () => modelService.list({ modality, category, q }),
  });

export const useTrendingModels = () =>
  useQuery({ queryKey: queryKeys.modelTrending, queryFn: () => modelService.trending() });

export const useModel = (id: string) =>
  useQuery({ queryKey: queryKeys.model(id), queryFn: () => modelService.byId(id), enabled: !!id });

/* ── Tools ────────────────────────────────── */
export const useTools = (pricing: PricingModel | 'all', category: ToolCategory | 'all' = 'all', q = '') =>
  useQuery({
    queryKey: queryKeys.tools(pricing, category, q),
    queryFn: () => toolService.list({ pricing, category, q }),
  });

export const useTrendingTools = () =>
  useQuery({ queryKey: queryKeys.toolsTrending, queryFn: () => toolService.trending() });

export const useTool = (id: string) =>
  useQuery({ queryKey: queryKeys.tool(id), queryFn: () => toolService.byId(id), enabled: !!id });

/* ── Learn AI ─────────────────────────────── */
export const useConcepts = (level: Level | 'all') =>
  useQuery({ queryKey: queryKeys.concepts(level), queryFn: () => learningService.list({ level }) });

export const useFeaturedConcepts = () =>
  useQuery({ queryKey: queryKeys.conceptFeatured, queryFn: () => learningService.featured() });

export const useConcept = (id: string) =>
  useQuery({ queryKey: queryKeys.concept(id), queryFn: () => learningService.byId(id), enabled: !!id });

/* ── Prompts ──────────────────────────────── */
export const usePrompts = (filter: Level | 'all') =>
  useQuery({ queryKey: queryKeys.prompts(filter), queryFn: () => promptService.list({ level: filter }) });

export const usePrompt = (id: string) =>
  useQuery({ queryKey: queryKeys.prompt(id), queryFn: () => promptService.byId(id), enabled: !!id });

/* ── Workflows ────────────────────────────── */
export const useWorkflows = () =>
  useQuery({ queryKey: queryKeys.workflows, queryFn: () => workflowService.list() });

export const useWorkflow = (id: string) =>
  useQuery({ queryKey: queryKeys.workflow(id), queryFn: () => workflowService.byId(id), enabled: !!id });

/* ── Agents ───────────────────────────────── */
export const useAgents = (filter: Autonomy | 'all') =>
  useQuery({ queryKey: queryKeys.agents(filter), queryFn: () => agentService.list({ autonomy: filter }) });

export const useAgent = (id: string) =>
  useQuery({ queryKey: queryKeys.agent(id), queryFn: () => agentService.byId(id), enabled: !!id });

export const useAgentLessons = () =>
  useQuery({ queryKey: queryKeys.agentLessons, queryFn: () => agentService.lessons() });

export const useAgentLesson = (id: string) =>
  useQuery({ queryKey: queryKeys.agentLesson(id), queryFn: () => agentService.lessonById(id), enabled: !!id });

/* ── Research ─────────────────────────────── */
export const useResearchPapers = () =>
  useQuery({ queryKey: queryKeys.research, queryFn: () => researchService.list() });

export const useResearchPaper = (id: string) =>
  useQuery({ queryKey: queryKeys.researchPaper(id), queryFn: () => researchService.byId(id), enabled: !!id });

/* ── Companies ────────────────────────────── */
export const useCompanies = () =>
  useQuery({ queryKey: queryKeys.companies, queryFn: () => companyService.list() });

export const useCompany = (id: string) =>
  useQuery({ queryKey: queryKeys.company(id), queryFn: () => companyService.byId(id), enabled: !!id });

/* ── Universal search ─────────────────────── */
export const useSearchResults = (q: string) =>
  useQuery({
    queryKey: queryKeys.search(q),
    queryFn: () => searchService.query(q),
    enabled: q.trim().length > 1,
    staleTime: 30_000,
  });

export const useSearchSuggestions = (q: string) =>
  useQuery({
    queryKey: queryKeys.searchSuggest(q),
    queryFn: () => searchService.suggest(q),
    enabled: q.trim().length >= 1,
    staleTime: 60_000,
  });

/* ── Cross-cutting ────────────────────────── */
export const useExploreOverview = () =>
  useQuery({ queryKey: queryKeys.exploreOverview, queryFn: () => exploreService.overview() });

export const useSavedItems = (items: SavedItem[]) => {
  const signature = items.map((item) => `${item.type}:${item.id}`).join('|');
  return useQuery({
    queryKey: queryKeys.savedResolve(signature),
    queryFn: () => savedService.resolve(items),
    enabled: items.length > 0,
  });
};

/* ── Prompt Lab ───────────────────────── */
export const useAnalyzePrompt = () =>
  useMutation({
    mutationFn: (request: { input: string; category?: PromptLabCategory }) =>
      promptLabService.analyze(request.input, request.category),
  });
