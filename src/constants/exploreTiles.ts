import type { Tone } from '@/theme/tokens';
import { EXPLORE_SECTIONS } from './taxonomy';

type SectionKey = (typeof EXPLORE_SECTIONS)[number]['key'];

/** Short names and colors for the "Explore AI" boxes on the first screen. Icons and routes come from EXPLORE_SECTIONS. */
const TILE_STYLE: Record<SectionKey, { label: string; tone: Tone }> = {
  models:    { label: 'Models',    tone: 'violet' },
  tools:     { label: 'Tools',     tone: 'accent' },
  concepts:  { label: 'Learn',     tone: 'info' },
  prompts:   { label: 'Prompts',   tone: 'rose' },
  workflows: { label: 'Guides',    tone: 'orange' },
  agents:    { label: 'Agents',    tone: 'success' },
  research:  { label: 'Research',  tone: 'warning' },
  companies: { label: 'Companies', tone: 'violet' },
};

export const EXPLORE_TILES = EXPLORE_SECTIONS.map((section) => ({
  key: section.key,
  label: TILE_STYLE[section.key].label,
  tone: TILE_STYLE[section.key].tone,
  icon: section.icon,
  route: section.route,
}));
