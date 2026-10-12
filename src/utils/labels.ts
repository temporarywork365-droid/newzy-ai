import type {
  Autonomy, CapabilityLevel, Complexity, Level, ModelCategory, ModelStatus, PricingModel,
} from '@/types';
import type { Tone } from '@/theme/tokens';

export const toneForStatus = (status: ModelStatus): Tone =>
  status === 'released' ? 'success' : status === 'preview' ? 'info' : status === 'rumored' ? 'warning' : 'danger';

export const toneForLevel = (level: Level): Tone =>
  level === 'beginner' ? 'success' : level === 'intermediate' ? 'info' : 'warning';

export const toneForPricing = (pricing: PricingModel): Tone =>
  pricing === 'free' ? 'success' : pricing === 'freemium' ? 'info' : 'neutral';

export const toneForComplexity = (complexity: Complexity): Tone =>
  complexity === 'simple' ? 'success' : complexity === 'moderate' ? 'info' : 'warning';

export const toneForAutonomy = (autonomy: Autonomy): Tone =>
  autonomy === 'assisted' ? 'info' : autonomy === 'semi-autonomous' ? 'warning' : 'danger';

export const toneForModelCategory = (category: ModelCategory): Tone =>
  category === 'frontier' ? 'accent'
    : category === 'open-weights' ? 'success'
    : category === 'multimodal' ? 'info'
    : category === 'reasoning' ? 'warning'
    : 'neutral';

export const toneForCapabilityLevel = (level: CapabilityLevel): Tone =>
  level === 'best-in-class' ? 'success' : level === 'strong' ? 'accent' : level === 'basic' ? 'info' : 'neutral';

/** Human-readable fallback for unknown backend keys — keeps the UI forward-compatible. */
export function prettifyKey(key: string): string {
  return key
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
