import { Ionicons } from '@expo/vector-icons';
import type { InterestKey } from '@/types/personalization';

export interface InterestDefinition {
  key: InterestKey;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const INTERESTS: InterestDefinition[] = [
  { key: 'ai-news',            label: 'AI News',            description: 'The daily pulse — launches, funding, policy',  icon: 'newspaper-outline' },
  { key: 'ai-agents',          label: 'AI Agents',          description: 'Autonomous teammates, tools and MCP',         icon: 'hardware-chip-outline' },
  { key: 'ai-coding',          label: 'AI Coding',          description: 'Copilots, coding agents and IDEs',            icon: 'terminal-outline' },
  { key: 'ai-video',           label: 'AI Video',           description: 'Generation, editing and filmmaking',          icon: 'videocam-outline' },
  { key: 'ai-image',           label: 'AI Image',           description: 'Image models, editing and design',            icon: 'image-outline' },
  { key: 'prompt-engineering', label: 'Prompt Engineering', description: 'Templates, techniques and the Lab',            icon: 'chatbubble-ellipses-outline' },
  { key: 'ai-research',        label: 'AI Research',        description: 'Papers and breakthroughs, explained',         icon: 'flask-outline' },
  { key: 'automation',         label: 'Automation',         description: 'Workflows, no-code and agents in ops',        icon: 'flash-outline' },
];

export const INTEREST_LABELS: Record<InterestKey, string> = INTERESTS.reduce(
  (labels, interest) => ({ ...labels, [interest.key]: interest.label }),
  {} as Record<InterestKey, string>,
);
