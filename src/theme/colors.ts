import type { Tone } from './tokens';

export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  tabBar: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
}

export const lightPalette: Palette = {
  background: '#F6F6F3',
  surface: '#FFFFFF',
  surfaceAlt: '#EDEDE9',
  border: '#E2E2DC',
  tabBar: '#FFFFFF',
  textPrimary: '#15181D',
  textSecondary: '#5B6470',
  textTertiary: '#98A0AC',
  accent: '#0C7C76',
  onAccent: '#FFFFFF',
  accentSoft: '#DEEDEB',
  success: '#1E7F4E',
  successSoft: '#E0F0E7',
  warning: '#96690F',
  warningSoft: '#F5EAD3',
  danger: '#B3372C',
  dangerSoft: '#F7E2DF',
  info: '#2F5FB0',
  infoSoft: '#E0E9F6',
};

export const darkPalette: Palette = {
  background: '#0C0F14',
  surface: '#151A23',
  surfaceAlt: '#1E2531',
  border: '#27303E',
  tabBar: '#10141B',
  textPrimary: '#E9EBF0',
  textSecondary: '#A8B0BD',
  textTertiary: '#6C7583',
  accent: '#35C4BD',
  onAccent: '#062725',
  accentSoft: '#14312F',
  success: '#55C78E',
  successSoft: '#12291D',
  warning: '#D9A741',
  warningSoft: '#2A2312',
  danger: '#E2685D',
  dangerSoft: '#2D1815',
  info: '#82A9E9',
  infoSoft: '#16222F',
};

export const toneSoftKey: Record<Tone, keyof Palette> = {
  neutral: 'surfaceAlt',
  accent: 'accentSoft',
  success: 'successSoft',
  warning: 'warningSoft',
  danger: 'dangerSoft',
  info: 'infoSoft',
};

export const toneStrongKey: Record<Tone, keyof Palette> = {
  neutral: 'textSecondary',
  accent: 'accent',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
};
