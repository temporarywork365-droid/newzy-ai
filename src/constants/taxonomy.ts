import { Ionicons } from '@expo/vector-icons';
import type {
  CapabilityKey, CapabilityLevel, EntityType, LearningTrack, Level, ModelCategory,
  Modality, NewsCategory, PricingModel, ToolCategory,
} from '@/types';

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  'ai-models': 'AI Models', 'ai-tools': 'AI Tools', research: 'Research',
  companies: 'Companies', startups: 'Startups', 'ai-agents': 'AI Agents',
  robotics: 'Robotics', 'ai-coding': 'AI Coding', 'ai-video': 'AI Video',
  'ai-image': 'AI Image', 'ai-audio': 'AI Audio', automation: 'Automation',
  regulation: 'Regulation', industry: 'Industry', 'india-ai': 'India AI',
};

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced',
};

export const MODEL_CATEGORY_LABELS: Record<ModelCategory, string> = {
  frontier: 'Frontier', 'open-weights': 'Open Weights', multimodal: 'Multimodal',
  reasoning: 'Reasoning', efficient: 'Efficiency',
};

export const CAPABILITY_LABELS: Record<CapabilityKey, string> = {
  reasoning: 'Reasoning', coding: 'Coding', multimodal: 'Multimodal',
  agentic: 'Agentic', 'long-context': 'Long Context',
  'structured-output': 'Structured Output', speed: 'Speed', languages: 'Languages',
};

export const CAPABILITY_LEVEL_LABELS: Record<CapabilityLevel, string> = {
  'best-in-class': 'Best-in-class', strong: 'Strong', basic: 'Basic', none: 'None',
};

export const MODALITY_LABELS: Record<Modality, string> = {
  text: 'Text', image: 'Image', audio: 'Audio', video: 'Video', code: 'Code',
};

export const MODEL_ACCESS_LABELS = {
  api: 'API', chat: 'Chat app', 'open-weights': 'Open weights',
} as const;

export const TOOL_CATEGORY_LABELS: Record<ToolCategory, string> = {
  writing: 'Writing', image: 'Image', video: 'Video', audio: 'Audio', music: 'Music',
  coding: 'Coding', research: 'Research', education: 'Education',
  automation: 'Automation', marketing: 'Marketing', design: 'Design',
  productivity: 'Productivity', data: 'Data', business: 'Business',
};

export const PRICING_MODEL_LABELS: Record<PricingModel, string> = {
  free: 'Free', freemium: 'Freemium', paid: 'Paid', enterprise: 'Enterprise',
};

export const LEARNING_TRACK_LABELS: Record<LearningTrack, string> = {
  foundations: 'Foundations', 'machine-learning': 'Machine Learning',
  'deep-learning': 'Deep Learning', nlp: 'NLP', 'generative-ai': 'Generative AI',
  agents: 'Agents', safety: 'Safety & Alignment',
};

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  article: 'News', tutorial: 'Tutorials', model: 'Models', tool: 'Tools',
  concept: 'Learn AI', prompt: 'Prompts', workflow: 'Workflows', agent: 'Agents',
  lesson: 'Agent Lessons', research: 'Research', company: 'Companies', topic: 'Topics',
};

export const ENTITY_ICONS: Record<EntityType, keyof typeof Ionicons.glyphMap> = {
  article: 'newspaper-outline', tutorial: 'book-outline', model: 'cube-outline',
  tool: 'construct-outline', concept: 'school-outline', prompt: 'chatbubble-ellipses-outline',
  workflow: 'git-network-outline', agent: 'hardware-chip-outline',
  lesson: 'bulb-outline', research: 'flask-outline', company: 'business-outline',
  topic: 'pricetags-outline',
};

export const POPULAR_SEARCHES = [
  'AI agents', 'GPT-5', 'prompt engineering', 'RAG',
  'open source', 'AI coding', 'context window', 'Claude', 'What is MCP?',
];

export const EXPLORE_SECTIONS = [
  { key: 'models',    title: 'AI Models',          description: 'Capabilities, benchmarks & pricing', icon: 'cube-outline',                route: '/explore/models' },
  { key: 'tools',     title: 'AI Tools',           description: 'The apps & products worth using',    icon: 'construct-outline',           route: '/explore/tools' },
  { key: 'concepts',  title: 'Learn AI',           description: 'From first principles to frontier',  icon: 'school-outline',              route: '/explore/learn' },
  { key: 'prompts',   title: 'Prompt Engineering', description: 'Battle-tested prompt templates',     icon: 'chatbubble-ellipses-outline', route: '/explore/prompts' },
  { key: 'workflows', title: 'AI Workflows',       description: 'Step-by-step recipes that work',     icon: 'git-network-outline',         route: '/explore/workflows' },
  { key: 'agents',    title: 'AI Agents',          description: 'Assisted to autonomous',             icon: 'hardware-chip-outline',       route: '/explore/agents' },
  { key: 'research',  title: 'AI Research',        description: 'Papers that matter, explained',      icon: 'flask-outline',               route: '/explore/research' },
  { key: 'companies', title: 'AI Companies',       description: 'Labs, startups & products',          icon: 'business-outline',            route: '/explore/companies' },
] as const;

export type ExploreSection = (typeof EXPLORE_SECTIONS)[number];
