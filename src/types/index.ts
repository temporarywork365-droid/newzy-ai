export type ISODate = string;

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

/* Search types */
export * from './search';

/* ── Content blocks (rendered by ContentRenderer) ── */
export type ContentBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'quote'; text: string; attribution?: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'code'; language?: string; code: string }
  | { kind: 'callout'; text: string; tone: 'info' | 'warning' | 'success' };

/* ── News engine ── */
export type NewsStatus =
  | 'draft' | 'processing' | 'review' | 'approved' | 'published' | 'archived';

export type NewsCategory =
  | 'ai-models' | 'ai-tools' | 'research' | 'companies' | 'startups'
  | 'ai-agents' | 'robotics' | 'ai-coding' | 'ai-video' | 'ai-image'
  | 'ai-audio' | 'automation' | 'regulation' | 'industry' | 'india-ai';

export interface Article {
  id: string;
  status: NewsStatus;
  category: NewsCategory;
  title: string;
  dek: string;
  summary: string;
  whatHappened: string;
  importantDetails: string[];
  whyItMatters: string;
  source: string;
  sourceUrl: string;
  publishedAt: ISODate;
  author: string;
  readMinutes: number;
  tags: string[];
  featured?: boolean;
  breaking?: boolean;
  trendingScore?: number;
  imageUrl?: string;
  relatedIds: string[];
  relatedTopicIds: string[];
  relatedModelIds: string[];
  relatedToolIds: string[];
}

export interface ArticleDetail extends Article {
  related: Article[];
  relatedTopics: Topic[];
  relatedModels: AIModel[];
  relatedTools: AITool[];
}

/* ── Models ── */
export type Modality = 'text' | 'image' | 'audio' | 'video' | 'code';
export type ModelStatus = 'released' | 'preview' | 'rumored' | 'deprecated';
export type ModelAccess = 'api' | 'chat' | 'open-weights';

export type ModelCategory = 'frontier' | 'open-weights' | 'multimodal' | 'reasoning' | 'efficient';

export type CapabilityLevel = 'best-in-class' | 'strong' | 'basic' | 'none';
export type CapabilityKey =
  | 'reasoning' | 'coding' | 'multimodal' | 'agentic'
  | 'long-context' | 'structured-output' | 'speed' | 'languages';

export interface ModelCapability {
  key: CapabilityKey;
  level: CapabilityLevel;
  note?: string;
}

export interface ModelVersion {
  version: string;
  releasedAt: ISODate;
  note?: string;
}

export interface BenchmarkScore { benchmark: string; score: number; max: number; note?: string; }
export interface PricingTier { tier: string; inputPerMTok: number; outputPerMTok: number; note?: string; }

export interface AIModel {
  id: string;
  name: string;
  developerId: string;
  developerName: string;
  family: string;
  category: ModelCategory;
  latestVersion: string;
  status: ModelStatus;
  releasedAt: ISODate;
  updatedAt: ISODate;
  versions: ModelVersion[];
  modalities: Modality[];
  access: ModelAccess[];
  contextWindow: number;
  parameters: string;
  license: string;
  summary: string;
  capabilities: ModelCapability[];
  strengths: string[];
  limitations: string[];
  useCases: string[];
  benchmarks: BenchmarkScore[];
  pricing: PricingTier[];
  tags: string[];
  website: string;
  relatedToolIds: string[];
  relatedModelIds: string[];
}

export interface ModelDetail extends AIModel {
  developer: Company | null;
  relatedTools: AITool[];
  relatedModels: AIModel[];
  latestUpdates: Article[];
}

/* ── Tools ── */
export type ToolCategory =
  | 'writing' | 'image' | 'video' | 'audio' | 'music' | 'coding'
  | 'research' | 'education' | 'automation' | 'marketing' | 'design'
  | 'productivity' | 'data' | 'business';
export type PricingModel = 'free' | 'freemium' | 'paid' | 'enterprise';

export interface AITool {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  category: ToolCategory;
  developer: string;
  pricingModel: PricingModel;
  priceFrom: string;
  rating?: number; // only set when a real public aggregate exists
  features: string[];
  bestFor: string[];
  integrations: string[];
  platforms: ('ios' | 'android' | 'web' | 'desktop' | 'api')[];
  website: string;
  tags: string[];
}

export interface ToolDetail extends AITool {
  related: AITool[];
  latestUpdates: Article[];
}

/* ── Learn AI (knowledge topics) ── */
export type LearningTrack =
  | 'foundations' | 'machine-learning' | 'deep-learning'
  | 'nlp' | 'generative-ai' | 'agents' | 'safety';
export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface Concept {
  id: string;
  title: string;
  level: Level;
  track: LearningTrack;
  readMinutes: number;
  definition: string;
  simpleExplanation: string;
  detailedExplanation: string;
  analogy: string;
  example: string;
  howItWorks: string[];
  applications: string[];
  advantages: string[];
  limitations: string[];
  relatedTopicIds: string[];
  sources: { title: string; url: string }[];
  tags: string[];
}

export interface ConceptDetail extends Concept {
  related: Concept[];
  latestDevelopments: Article[];
}

/* ── Prompt engineering ── */
export interface PromptVariable { name: string; description: string; example: string; }

export interface PromptTemplate {
  id: string;
  title: string;
  intent: string;
  task: string;
  level: Level;
  models: string[];
  template: string;
  variables: PromptVariable[];
  tips: string[];
  example?: { input: string; output: string };
  tags: string[];
}

/* ── Workflows ── */
export type Complexity = 'simple' | 'moderate' | 'advanced';

export interface WorkflowStep {
  step: number;
  title: string;
  detail: string;
  toolId?: string;
  promptId?: string;
  tip?: string;
  automatable?: boolean;
}

export interface Workflow {
  id: string;
  title: string;
  goal: string;
  complexity: Complexity;
  estimatedTime: string;
  input: string;
  expectedOutput: string;
  requiredToolIds: string[];
  steps: WorkflowStep[];
  automationOpportunities: string[];
  alternatives: string[];
  limitations: string[];
  tags: string[];
}

export interface WorkflowDetail extends Workflow {
  tools: AITool[];
  prompts: PromptTemplate[];
}

/* ── Agents ── */
export type Autonomy = 'assisted' | 'semi-autonomous' | 'autonomous';

export interface AgentProfile {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  category: string;
  autonomy: Autonomy;
  capabilities: string[];
  frameworks: string[];
  pricingModel: string;
  website: string;
  tags: string[];
}

/* ── Agent Academy (educational lessons) ── */
export interface AgentLesson {
  id: string;
  title: string;
  order: number;
  summary: string;
  readMinutes: number;
  content: ContentBlock[];
  relatedAgentIds: string[];
  relatedConceptIds: string[];
  tags: string[];
}

export interface AgentLessonDetail extends AgentLesson {
  relatedAgents: AgentProfile[];
  relatedConcepts: Concept[];
}

/* ── Research ── */
export interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  institutions: string[];
  publishedAt: ISODate;
  venue: string;
  url: string;
  significance: string;
  keyFindings: string[];
  tags: string[];
}

/* ── Companies ── */
export interface FundingInfo {
  totalRaised: string;
  lastRound: string;
  lastRoundAt?: ISODate; // omitted when unknown
  investors: string[];
}

export interface Company {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  hq: string;
  founded: number;
  founders: string[];
  focus: string[];
  keyProducts: string[];
  funding: FundingInfo;
  employees: string;
  website: string;
  modelIds: string[];
  tags: string[];
}

export interface CompanyDetail extends Company { models: AIModel[]; }

/* ── Topics (discovery pages) ── */
export interface Topic {
  id: string;
  name: string;
  tagline: string;
  description: string;
  trending: boolean;
  relatedArticleIds: string[];
  relatedModelIds: string[];
  relatedToolIds: string[];
  relatedResearchIds: string[];
  tags: string[];
}

export interface TopicDetail extends Topic {
  articles: Article[];
  models: AIModel[];
  tools: AITool[];
  research: ResearchPaper[];
  stats: { articles: number; models: number; tools: number; research: number };
}

/* ── Daily digest ── */
export interface DailyDigest {
  date: ISODate;
  headline: string;
  summary: string;
  topStoryId: string;
  stats: { label: string; value: string }[];
}

/* ── Cross-cutting ── */
export type EntityType =
  | 'article' | 'tutorial' | 'model' | 'tool' | 'concept' | 'prompt'
  | 'workflow' | 'agent' | 'lesson' | 'research' | 'company' | 'topic';

export interface SavedItem { id: string; type: EntityType; savedAt: number; }
export interface SavedItemResolved extends SavedItem {
  title: string;
  subtitle: string;
  route: string;
}

export type ExploreSectionKey =
  | 'models' | 'tools' | 'concepts' | 'prompts'
  | 'workflows' | 'agents' | 'research' | 'companies';
export type ExploreCounts = Record<ExploreSectionKey, number>;
