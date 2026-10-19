import type { Tone } from '@/theme/tokens';
import type { NewsCategory } from '@/types';

/**
 * One color per news category, so a story's color tells you what it is about at a glance.
 * (Record<NewsCategory, Tone> makes TypeScript complain if a new category is added without a color.)
 */
export const NEWS_CATEGORY_TONE: Record<NewsCategory, Tone> = {
  'ai-models': 'violet',
  'ai-tools': 'accent',
  research: 'info',
  companies: 'warning',
  startups: 'orange',
  'ai-agents': 'rose',
  robotics: 'success',
  'ai-coding': 'info',
  'ai-video': 'rose',
  'ai-image': 'violet',
  'ai-audio': 'orange',
  automation: 'accent',
  regulation: 'danger',
  industry: 'neutral',
  'india-ai': 'orange',
};
