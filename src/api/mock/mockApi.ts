import { ApiError } from '../errors';
import type { QueryParams } from '../types';
import { LEARNING_TRACK_LABELS, MODALITY_LABELS, NEWS_CATEGORY_LABELS, POPULAR_SEARCHES } from '@/constants/taxonomy';
import { delay } from '@/utils/async';
import type {
  Article, DailyDigest, EntityType, KnowledgeCard, KnowledgeEntry, Modality, Paginated,
  SavedItem, SavedItemResolved, SearchSuggestion, SearchResult,
} from '@/types';
import type { PromptLabCategory } from '@/types/promptLab';
import { agentLessons } from './data/agentLessons';
import { agents } from './data/agents';
import { articles } from './data/articles';
import { companies } from './data/companies';
import { concepts } from './data/concepts';
import { knowledge } from './data/knowledge';
import { models } from './data/models';
import { prompts } from './data/prompts';
import { research } from './data/research';
import { digest, topics } from './data/topics';
import { tools } from './data/tools';
import { workflows } from './data/workflows';
import { useLiveStatusStore } from '@/store/liveStatusStore';
import { clearLiveDataCache, getLiveArticles, getLiveDigest } from './liveData';
import { analyzePrompt } from './promptLabEngine';

/* ── news engine rules ───────────────────────
   The app is a consumer: it never scrapes or processes. The engine serves
   ONLY items that completed the full pipeline (status === 'published'). */

let allArticles: Article[] = articles;
let publishedArticles: Article[] = articles.filter((article) => article.status === 'published');
let activeDigest: DailyDigest = digest;

/* ── auth + preferences (demo state, backend stand-in) ── */

let remotePreferences: { interests: string[] } = { interests: [] };

const userFromEmail = (email: string) => ({
  id: 'demo-user',
  email,
  name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase()) || 'Newzy User',
  plan: 'free' as const,
});

/* ── search engine helpers ─────────────────── */

const STOP_WORDS = new Set([
  'what', 'is', 'are', 'the', 'a', 'an', 'how', 'does', 'do', 'work', 'works',
  'best', 'latest', 'new', 'vs', 'versus', 'for', 'about', 'tell', 'me',
  'explain', 'to', 'in', 'of', 'and', 'or', 'top', 'good', 'show', 'find',
]);

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[?.,!'"-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function matchesTokens(haystack: string, tokens: string[]): boolean {
  const hay = haystack.toLowerCase();
  return tokens.every((token) => hay.includes(token));
}

const knowledgeHaystack = (entry: KnowledgeEntry): string =>
  `${entry.term} ${entry.aliases.join(' ')} ${entry.tags.join(' ')}`.toLowerCase();

function matchKnowledge(tokens: string[]): KnowledgeEntry | undefined {
  if (tokens.length === 0) return undefined;
  const candidates = knowledge.filter((entry) =>
    tokens.every((token) => knowledgeHaystack(entry).includes(token)),
  );
  if (candidates.length === 0) return undefined;
  const strongMatches = (entry: KnowledgeEntry) => {
    const termHaystack = `${entry.term} ${entry.aliases.join(' ')}`.toLowerCase();
    return tokens.filter((token) => termHaystack.includes(token)).length;
  };
  return [...candidates].sort((a, b) => strongMatches(b) - strongMatches(a))[0];
}

function buildKnowledgeCard(entry: KnowledgeEntry): KnowledgeCard {
  const latestUpdates: SearchResult[] = publishedArticles
    .filter((article) => entry.relatedArticleIds.includes(article.id))
    .map((article) => ({
      type: 'article', id: article.id, title: article.title,
      subtitle: `${article.source} · ${article.readMinutes} min read`,
      route: `/article/${article.id}`, tags: article.tags,
    }));
  return {
    id: entry.id, term: entry.term, definition: entry.definition,
    simpleExplanation: entry.simpleExplanation, detailedExplanation: entry.detailedExplanation,
    example: entry.example, realWorldUse: entry.realWorldUse,
    relatedTopicIds: entry.relatedTopicIds, latestUpdates,
    sources: entry.sources, relatedSearches: entry.relatedSearches,
  };
}

function buildRelatedQueries(query: string, tokens: string[], matched: KnowledgeEntry | undefined): string[] {
  const seen = new Set<string>([query.toLowerCase()]);
  const pool: string[] = [
    ...(matched?.relatedSearches ?? []), ...POPULAR_SEARCHES,
    ...topics.map((topic) => topic.name),
    ...models.map((model) => model.name),
    ...tools.map((tool) => tool.name),
  ];
  return pool
    .filter((candidate) => {
      const lower = candidate.toLowerCase();
      if (seen.has(lower)) return false;
      if (!tokens.some((token) => lower.includes(token))) return false;
      seen.add(lower);
      return true;
    })
    .slice(0, 6);
}

const suggestionPool: SearchSuggestion[] = [
  ...POPULAR_SEARCHES.map((text) => ({ text, hint: 'Trending' })),
  ...knowledge.map((entry) => ({ text: `What is ${entry.term}?`, hint: 'Term' })),
  ...topics.map((topic) => ({ text: topic.name, hint: 'Topic' })),
  ...models.map((model) => ({ text: model.name, hint: 'Model' })),
  ...tools.map((tool) => ({ text: tool.name, hint: 'Tool' })),
  ...concepts.map((concept) => ({ text: concept.title, hint: 'Learn' })),
  ...agentLessons.map((lesson) => ({ text: lesson.title, hint: 'Lesson' })),
];

/* ── generic helpers ───────────────────────── */

function param(params: QueryParams, key: string): string | undefined {
  const value = params[key];
  return value === undefined || value === null || value === '' ? undefined : String(value);
}

function paginate<T>(items: T[], params: QueryParams): Paginated<T> {
  const page = Math.max(1, Number(param(params, 'page') ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(param(params, 'pageSize') ?? 10) || 10));
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return { items: slice, page, pageSize, total: items.length, hasMore: start + slice.length < items.length };
}

function findBy<T extends { id: string }>(items: T[], id: string, label: string): T {
  const found = items.find((item) => item.id === id);
  if (!found) throw new ApiError(404, `${label} not found: ${id}`, 'NOT_FOUND');
  return found;
}

const byNewest = (a: { publishedAt: string }, b: { publishedAt: string }) =>
  b.publishedAt.localeCompare(a.publishedAt);
const byRelease = (a: { releasedAt: string }, b: { releasedAt: string }) =>
  b.releasedAt.localeCompare(a.releasedAt);
const byTrending = (a: { trendingScore?: number }, b: { trendingScore?: number }) =>
  (b.trendingScore ?? 0) - (a.trendingScore ?? 0);

/* ── search index ──────────────────────────── */

interface IndexedEntry extends SearchResult { haystack: string; }

const isTutorial = (article: { tags: string[] }) =>
  article.tags.some((tag) => tag.toLowerCase() === 'tutorial');

const toArticleEntry = (article: Article): IndexedEntry => ({
  type: isTutorial(article) ? ('tutorial' as const) : ('article' as const),
  id: article.id, title: article.title,
  subtitle: `${article.source} · ${article.readMinutes} min read`,
  route: `/article/${article.id}`, tags: article.tags,
  haystack: `${article.title} ${article.dek} ${article.summary} ${article.tags.join(' ')} ${article.category} ${
    isTutorial(article) ? 'tutorial how to guide' : 'news'
  }`.toLowerCase(),
});

const nonArticleEntries: IndexedEntry[] = [
  ...models.map((model) => ({ type: 'model' as const, id: model.id, title: model.name, subtitle: `${model.developerName} · ${model.modalities.map((x) => MODALITY_LABELS[x]).join(' / ')}`, route: `/model/${model.id}`, tags: model.tags, haystack: `${model.name} ${model.developerName} ${model.family} ${model.summary} ${model.tags.join(' ')} ${model.category}`.toLowerCase() })),
  ...tools.map((tool) => ({ type: 'tool' as const, id: tool.id, title: tool.name, subtitle: tool.tagline, route: `/tool/${tool.id}`, tags: tool.tags, haystack: `${tool.name} ${tool.tagline} ${tool.summary} ${tool.developer} ${tool.tags.join(' ')} ${tool.category}`.toLowerCase() })),
  ...concepts.map((concept) => ({ type: 'concept' as const, id: concept.id, title: concept.title, subtitle: `${LEARNING_TRACK_LABELS[concept.track]} · ${concept.level}`, route: `/concept/${concept.id}`, tags: concept.tags, haystack: `${concept.title} ${concept.definition} ${concept.tags.join(' ')}`.toLowerCase() })),
  ...prompts.map((prompt) => ({ type: 'prompt' as const, id: prompt.id, title: prompt.title, subtitle: prompt.task, route: `/prompt/${prompt.id}`, tags: prompt.tags, haystack: `${prompt.title} ${prompt.intent} ${prompt.task} ${prompt.tags.join(' ')}`.toLowerCase() })),
  ...workflows.map((workflow) => ({
    type: 'workflow' as const, id: workflow.id, title: workflow.title,
    subtitle: `${workflow.complexity} · ${workflow.steps.length} steps`,
    route: `/workflow/${workflow.id}`, tags: workflow.tags,
    haystack: `${workflow.title} ${workflow.goal} ${workflow.input} ${workflow.expectedOutput} ${workflow.tags.join(' ')} ${
      tools.filter((tool) => workflow.requiredToolIds.includes(tool.id)).map((tool) => tool.name).join(' ')
    }`.toLowerCase(),
  })),
  ...agents.map((agent) => ({ type: 'agent' as const, id: agent.id, title: agent.name, subtitle: agent.tagline, route: `/agent/${agent.id}`, tags: agent.tags, haystack: `${agent.name} ${agent.tagline} ${agent.summary} ${agent.tags.join(' ')} ${agent.category}`.toLowerCase() })),
  ...agentLessons.map((lesson) => ({ type: 'lesson' as const, id: lesson.id, title: lesson.title, subtitle: `Agent Academy · Lesson ${lesson.order}`, route: `/lesson/${lesson.id}`, tags: lesson.tags, haystack: `${lesson.title} ${lesson.summary} ${lesson.tags.join(' ')} agents`.toLowerCase() })),
  ...research.map((paper) => ({ type: 'research' as const, id: paper.id, title: paper.title, subtitle: paper.venue, route: `/research/${paper.id}`, tags: paper.tags, haystack: `${paper.title} ${paper.abstract} ${paper.tags.join(' ')} ${paper.authors.join(' ')}`.toLowerCase() })),
  ...companies.map((company) => ({ type: 'company' as const, id: company.id, title: company.name, subtitle: company.tagline, route: `/company/${company.id}`, tags: company.tags, haystack: `${company.name} ${company.tagline} ${company.summary} ${company.tags.join(' ')}`.toLowerCase() })),
  ...topics.map((topic) => ({ type: 'topic' as const, id: topic.id, title: topic.name, subtitle: topic.tagline, route: `/topic/${topic.id}`, tags: topic.tags, haystack: `${topic.name} ${topic.tagline} ${topic.description} ${topic.tags.join(' ')}`.toLowerCase() })),
];

let searchIndex: IndexedEntry[] = [...publishedArticles.map(toArticleEntry), ...nonArticleEntries];

/* ── live data (GitHub Actions pipeline) ──────
   scripts/generate-news.mjs commits data/live/*.json; liveData.ts downloads it. We fetch once per
   app session. If the download fails or has nothing usable, the built-in sample data stays, so the
   app never breaks. When live data arrives it replaces the sample NEWS; the built-in tutorials
   (learning content) are kept. */

const isUsableLiveArticle = (a: Partial<Article>): boolean =>
  !!a && typeof a.id === 'string' && typeof a.title === 'string' && typeof a.publishedAt === 'string'
  && typeof a.category === 'string' && Array.isArray(a.tags) && a.status === 'published'
  && !Number.isNaN(new Date(a.publishedAt).getTime());

const normalizeLiveArticle = (a: Article): Article => ({
  ...a,
  imageUrl: a.imageUrl ?? undefined, // pipeline writes null; the UI expects undefined
  readMinutes: a.readMinutes ?? 3,
  importantDetails: Array.isArray(a.importantDetails) ? a.importantDetails : [],
  relatedIds: a.relatedIds ?? [],
  relatedTopicIds: a.relatedTopicIds ?? [],
  relatedModelIds: a.relatedModelIds ?? [],
  relatedToolIds: a.relatedToolIds ?? [],
});

let liveReady: Promise<void> | null = null;
let liveSignature = ''; // ids of the live stories we currently show, to tell whether a refresh brought anything new

function ensureLiveData(): Promise<void> {
  if (!liveReady) {
    liveReady = (async () => {
      try {
        const [liveArticles, liveDigest] = await Promise.all([getLiveArticles(), getLiveDigest()]);
        const usable = Array.isArray(liveArticles)
          ? liveArticles.filter(isUsableLiveArticle).map(normalizeLiveArticle)
          : [];
        if (usable.length === 0) return; // keep sample data

        liveSignature = usable.map((article) => article.id).join(',');
        useLiveStatusStore.getState().markUpdated();

        allArticles = [...usable, ...articles.filter(isTutorial)];
        publishedArticles = allArticles.filter((article) => article.status === 'published');
        searchIndex = [...publishedArticles.map(toArticleEntry), ...nonArticleEntries];

        if (liveDigest && typeof liveDigest.headline === 'string' && Array.isArray(liveDigest.stats)) {
          activeDigest = {
            ...liveDigest,
            // The pipeline writes raw category ids ("ai-models"); show the friendly names.
            stats: liveDigest.stats.map((stat) => ({
              ...stat,
              label: NEWS_CATEGORY_LABELS[stat.label as keyof typeof NEWS_CATEGORY_LABELS] ?? stat.label,
            })),
          };
        }
      } catch {
        /* never let live data break the app */
      }
    })();
  }
  return liveReady;
}

/** Pull-to-refresh and the automatic refresh call this: forget the cached download and fetch the newest news
    from GitHub again. Returns true if the stories changed. If the phone is offline, the last live data already
    in memory stays on screen (and it returns false). */
export async function refreshLiveData(): Promise<boolean> {
  const before = liveSignature;
  clearLiveDataCache();
  liveReady = null;
  await ensureLiveData();
  return liveSignature !== before; // true when new or changed stories arrived
}

/* ── transport ─────────────────────────────── */

export async function mockRequest<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
  params: QueryParams = {},
): Promise<T> {
  await ensureLiveData();
  await delay(220 + Math.random() * 380);
  return method === 'GET' ? await handleGet<T>(path, params) : handlePost<T>(path, body);
}

function handleGet<T>(path: string, params: QueryParams): T {
  /* Universal search */
  if (path === '/search/suggest') {
    const q = (param(params, 'q') ?? '').trim().toLowerCase();
    if (q.length === 0) return [] as T;
    const seen = new Set<string>();
    const matches = suggestionPool
      .filter((suggestion) => {
        const lower = suggestion.text.toLowerCase();
        if (seen.has(lower) || !lower.includes(q)) return false;
        seen.add(lower);
        return true;
      })
      .sort((a, b) =>
        Number(b.text.toLowerCase().startsWith(q)) - Number(a.text.toLowerCase().startsWith(q)),
      );
    return matches.slice(0, 8) as T;
  }

  if (path === '/search') {
    const query = param(params, 'q') ?? '';
    const tokens = tokenize(query);
    const results: SearchResult[] = tokens.length === 0
      ? []
      : searchIndex
          .filter((entry) => tokens.every((token) => entry.haystack.includes(token)))
          .slice(0, 30)
          .map(({ haystack, ...rest }) => rest);
    const matched = matchKnowledge(tokens);
    return {
      query, engine: 'keyword-v1', tookMs: 5 + Math.round(Math.random() * 35),
      results, relatedQueries: buildRelatedQueries(query, tokens, matched),
      knowledge: matched ? buildKnowledgeCard(matched) : null,
    } as T;
  }

  /* Digest */
  if (path === '/digest/today') return activeDigest as T;

  /* News (published-only) */
  if (path === '/news') {
    const category = param(params, 'category');
    const tag = param(params, 'tag');
    const filtered = publishedArticles
      .filter((article) => (!category || category === 'all' || article.category === category)
        && (!tag || article.tags.some((t) => t.toLowerCase() === tag.toLowerCase())))
      .sort(byNewest);
    return paginate(filtered, params) as T;
  }
  if (path === '/news/featured') return publishedArticles.filter((article) => article.featured).slice(0, 3) as T;
  if (path === '/news/breaking') return publishedArticles.filter((article) => article.breaking).sort(byNewest) as T;
  if (path === '/news/trending') return [...publishedArticles].sort(byTrending).slice(0, 5) as T;
  if (path.startsWith('/news/')) {
    const article = findBy(allArticles, path.slice('/news/'.length), 'Article');
    if (article.status !== 'published') throw new ApiError(404, 'Article is not published', 'NOT_PUBLISHED');
    return {
      ...article,
      related: publishedArticles.filter((a) => article.relatedIds.includes(a.id)),
      relatedTopics: topics.filter((topic) => article.relatedTopicIds.includes(topic.id)),
      relatedModels: models.filter((model) => article.relatedModelIds.includes(model.id)),
      relatedTools: tools.filter((tool) => article.relatedToolIds.includes(tool.id)),
    } as T;
  }

  /* Topics */
  if (path === '/topics') return topics as T;
  if (path === '/topics/trending') return topics.filter((topic) => topic.trending) as T;
  if (path.startsWith('/topics/')) {
    const topic = findBy(topics, path.slice('/topics/'.length), 'Topic');
    const topicArticles = publishedArticles.filter((article) => topic.relatedArticleIds.includes(article.id)).sort(byNewest);
    const topicModels = models.filter((model) => topic.relatedModelIds.includes(model.id));
    const topicTools = tools.filter((tool) => topic.relatedToolIds.includes(tool.id));
    const topicResearch = research.filter((paper) => topic.relatedResearchIds.includes(paper.id));
    return {
      ...topic, articles: topicArticles, models: topicModels, tools: topicTools, research: topicResearch,
      stats: { articles: topicArticles.length, models: topicModels.length, tools: topicTools.length, research: topicResearch.length },
    } as T;
  }

  /* Model directory — search, category + modality filters */
  if (path === '/models') {
    const modality = param(params, 'modality');
    const category = param(params, 'category');
    const q = param(params, 'q');
    const tokens = tokenize(q ?? '');
    return models.filter((model) =>
      (!modality || modality === 'all' || model.modalities.includes(modality as Modality))
      && (!category || category === 'all' || model.category === category)
      && (tokens.length === 0 || matchesTokens(
        `${model.name} ${model.developerName} ${model.family} ${model.summary} ${model.tags.join(' ')} ${model.category}`,
        tokens,
      )),
    ) as T;
  }
  if (path === '/models/trending') return [...models].sort(byRelease).slice(0, 6) as T;
  if (path.startsWith('/models/')) {
    const model = findBy(models, path.slice('/models/'.length), 'Model');
    return {
      ...model,
      developer: companies.find((company) => company.id === model.developerId) ?? null,
      relatedTools: tools.filter((tool) => model.relatedToolIds.includes(tool.id)),
      relatedModels: models.filter((other) => model.relatedModelIds.includes(other.id)),
      latestUpdates: publishedArticles
        .filter((article) => article.relatedModelIds.includes(model.id))
        .sort(byNewest)
        .slice(0, 3),
    } as T;
  }

  /* Tool directory — search, category + pricing filters */
  if (path === '/tools') {
    const pricing = param(params, 'pricing');
    const category = param(params, 'category');
    const q = param(params, 'q');
    const tokens = tokenize(q ?? '');
    return tools.filter((tool) =>
      (!pricing || pricing === 'all' || tool.pricingModel === pricing)
      && (!category || category === 'all' || tool.category === category)
      && (tokens.length === 0 || matchesTokens(
        `${tool.name} ${tool.tagline} ${tool.summary} ${tool.developer} ${tool.tags.join(' ')} ${tool.category}`,
        tokens,
      )),
    ) as T;
  }
  if (path === '/tools/trending') return [...tools].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4) as T;
  if (path.startsWith('/tools/')) {
    const tool = findBy(tools, path.slice('/tools/'.length), 'Tool');
    return {
      ...tool,
      related: tools.filter((other) => other.id !== tool.id && other.category === tool.category).slice(0, 3),
      latestUpdates: publishedArticles
        .filter((article) => article.relatedToolIds.includes(tool.id))
        .sort(byNewest)
        .slice(0, 3),
    } as T;
  }

  /* Learn AI — knowledge topics */
  if (path === '/concepts') {
    const level = param(params, 'level');
    const track = param(params, 'track');
    return concepts.filter((concept) => (!level || level === 'all' || concept.level === level)
      && (!track || track === 'all' || concept.track === track)) as T;
  }
  if (path === '/concepts/featured') {
    return concepts.filter((concept) => concept.level === 'beginner').slice(0, 3) as T;
  }
  if (path.startsWith('/concepts/')) {
    const concept = findBy(concepts, path.slice('/concepts/'.length), 'Concept');
    const related = concepts.filter((other) => concept.relatedTopicIds.includes(other.id));
    const latestDevelopments = publishedArticles
      .filter((article) => article.tags.some((tag) => concept.tags.includes(tag.toLowerCase())))
      .sort(byNewest)
      .slice(0, 3);
    return { ...concept, related, latestDevelopments } as T;
  }

  /* Prompts */
  if (path === '/prompts') {
    const level = param(params, 'level');
    const task = param(params, 'task');
    return prompts.filter((prompt) => (!level || level === 'all' || prompt.level === level)
      && (!task || prompt.task === task)) as T;
  }
  if (path.startsWith('/prompts/')) {
    return findBy(prompts, path.slice('/prompts/'.length), 'Prompt') as T;
  }

  /* Workflows — detail composes tools + prompts */
  if (path === '/workflows') return workflows as T;
  if (path.startsWith('/workflows/')) {
    const workflow = findBy(workflows, path.slice('/workflows/'.length), 'Workflow');
    const stepPromptIds = workflow.steps
      .map((step) => step.promptId)
      .filter((promptId): promptId is string => Boolean(promptId));
    return {
      ...workflow,
      tools: tools.filter((tool) => workflow.requiredToolIds.includes(tool.id)),
      prompts: prompts.filter((prompt) => stepPromptIds.includes(prompt.id)),
    } as T;
  }

  /* Agents + Agent Academy */
  if (path === '/agents') {
    const autonomy = param(params, 'autonomy');
    return agents.filter((agent) => !autonomy || autonomy === 'all' || agent.autonomy === autonomy) as T;
  }
  if (path.startsWith('/agents/')) return findBy(agents, path.slice('/agents/'.length), 'Agent') as T;

  if (path === '/agent-lessons') return agentLessons as T;
  if (path.startsWith('/agent-lessons/')) {
    const lesson = findBy(agentLessons, path.slice('/agent-lessons/'.length), 'Lesson');
    return {
      ...lesson,
      relatedAgents: agents.filter((agent) => lesson.relatedAgentIds.includes(agent.id)),
      relatedConcepts: concepts.filter((concept) => lesson.relatedConceptIds.includes(concept.id)),
    } as T;
  }

  /* Research / Companies */
  if (path === '/research') return research as T;
  if (path.startsWith('/research/')) return findBy(research, path.slice('/research/'.length), 'Research paper') as T;

  if (path === '/companies') return companies as T;
  if (path.startsWith('/companies/')) {
    const company = findBy(companies, path.slice('/companies/'.length), 'Company');
    return { ...company, models: models.filter((model) => company.modelIds.includes(model.id)) } as T;
  }

  /* Auth + profile */
  if (path === '/auth/me') {
    const token = param(params, 'token') ?? '';
    const email = decodeURIComponent(token.replace('demo-token-', '')) || 'demo@newzy.ai';
    return userFromEmail(email) as T;
  }
  if (path === '/profile/preferences') return remotePreferences as T;

  /* Explore */
  if (path === '/explore/overview') {
    return {
      models: models.length, tools: tools.length, concepts: concepts.length,
      prompts: prompts.length, workflows: workflows.length, agents: agents.length,
      research: research.length, companies: companies.length,
    } as T;
  }

  throw new ApiError(404, `No mock handler for GET ${path}`, 'NO_HANDLER');
}

function handlePost<T>(path: string, body: unknown): T {
  if (path === '/saved/resolve') {
    const request = (body ?? { items: [] }) as { items: SavedItem[] };
    const resolved: SavedItemResolved[] = [];
    for (const item of request.items ?? []) {
      const entry = resolveSaved(item.type, item.id);
      if (entry) resolved.push({ ...item, ...entry });
    }
    return resolved as T;
  }
  if (path === '/prompt-lab/analyze') {
    const request = (body ?? {}) as { input?: string; category?: PromptLabCategory };
    const promptInput = (request.input ?? '').trim();
    if (promptInput.length < 3) {
      throw new ApiError(400, 'Prompt is too short to analyze', 'INVALID_INPUT');
    }
    return analyzePrompt(promptInput, request.category) as T;
  }
  if (path === '/auth/login' || path === '/auth/register') {
    const request = (body ?? {}) as { email?: string; password?: string };
    const email = (request.email ?? '').trim().toLowerCase();
    const password = request.password ?? '';
    if (!email.includes('@') || password.length < 6) {
      throw new ApiError(401, 'Invalid credentials. Demo rule: any email + a 6+ character password.', 'AUTH_INVALID');
    }
    return { token: `demo-token-${encodeURIComponent(email)}`, user: userFromEmail(email) } as T;
  }
  if (path === '/auth/logout') return { ok: true } as T;
  if (path === '/profile/preferences') {
    const request = (body ?? {}) as { interests?: string[] };
    remotePreferences = { interests: request.interests ?? [] };
    return remotePreferences as T;
  }
  throw new ApiError(404, `No mock handler for POST ${path}`, 'NO_HANDLER');
}

function resolveSaved(
  type: EntityType,
  id: string,
): Pick<SavedItemResolved, 'title' | 'subtitle' | 'route'> | undefined {
  switch (type) {
    case 'article': { const a = publishedArticles.find((x) => x.id === id); return a ? { title: a.title, subtitle: `${a.source} · ${a.readMinutes} min read`, route: `/article/${id}` } : undefined; }
    case 'tutorial': { const a = publishedArticles.find((x) => x.id === id); return a ? { title: a.title, subtitle: `${a.source} · ${a.readMinutes} min read`, route: `/article/${id}` } : undefined; }
    case 'model': { const m = models.find((x) => x.id === id); return m ? { title: m.name, subtitle: m.developerName, route: `/model/${id}` } : undefined; }
    case 'tool': { const t = tools.find((x) => x.id === id); return t ? { title: t.name, subtitle: t.tagline, route: `/tool/${id}` } : undefined; }
    case 'concept': { const c = concepts.find((x) => x.id === id); return c ? { title: c.title, subtitle: LEARNING_TRACK_LABELS[c.track], route: `/concept/${id}` } : undefined; }
    case 'prompt': { const p = prompts.find((x) => x.id === id); return p ? { title: p.title, subtitle: p.task, route: `/prompt/${id}` } : undefined; }
    case 'workflow': { const w = workflows.find((x) => x.id === id); return w ? { title: w.title, subtitle: w.goal, route: `/workflow/${id}` } : undefined; }
    case 'agent': { const a = agents.find((x) => x.id === id); return a ? { title: a.name, subtitle: a.tagline, route: `/agent/${id}` } : undefined; }
    case 'lesson': { const l = agentLessons.find((x) => x.id === id); return l ? { title: l.title, subtitle: 'Agent Academy', route: `/lesson/${id}` } : undefined; }
    case 'research': { const r = research.find((x) => x.id === id); return r ? { title: r.title, subtitle: r.venue, route: `/research/${id}` } : undefined; }
    case 'company': { const c = companies.find((x) => x.id === id); return c ? { title: c.name, subtitle: c.tagline, route: `/company/${id}` } : undefined; }
    case 'topic': { const t = topics.find((x) => x.id === id); return t ? { title: t.name, subtitle: t.tagline, route: `/topic/${id}` } : undefined; }
    default: return undefined;
  }
}
