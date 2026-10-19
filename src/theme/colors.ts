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
  /* Extra colors that give categories and boxes their own identity. */
  violet: string;
  violetSoft: string;
  rose: string;
  roseSoft: string;
  orange: string;
  orangeSoft: string;
}

/* Text colors were tuned so every text/background pair passes the 4.5:1 readability guideline (WCAG AA). */
export const lightPalette: Palette = {
  background: '#F6F6F3',
  surface: '#FFFFFF',
  surfaceAlt: '#EDEDE9',
  border: '#E2E2DC',
  tabBar: '#FFFFFF',
  textPrimary: '#15181D',
  textSecondary: '#454E5A',
  textTertiary: '#626C78',
  accent: '#0B736E',
  onAccent: '#FFFFFF',
  accentSoft: '#DEEDEB',
  success: '#1C7749',
  successSoft: '#E0F0E7',
  warning: '#8A610E',
  warningSoft: '#F5EAD3',
  danger: '#B3372C',
  dangerSoft: '#F7E2DF',
  info: '#2F5FB0',
  infoSoft: '#E0E9F6',
  violet: '#6D4FD6',
  violetSoft: '#EFEAFB',
  rose: '#BE2F6E',
  roseSoft: '#FBE7F0',
  orange: '#AF4F0A',
  orangeSoft: '#FDEEDD',
};

export const darkPalette: Palette = {
  background: '#05070B',
  surface: '#0F141B',
  surfaceAlt: '#18202A',
  border: '#232C38',
  tabBar: '#080B10',
  textPrimary: '#EEF1F6',
  textSecondary: '#B0B8C5',
  textTertiary: '#8B95A3',
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
  violet: '#A78BFA',
  violetSoft: '#221A3F',
  rose: '#F472B6',
  roseSoft: '#3B1829',
  orange: '#FB923C',
  orangeSoft: '#3A2110',
};

export const toneSoftKey: Record<Tone, keyof Palette> = {
  neutral: 'surfaceAlt',
  accent: 'accentSoft',
  success: 'successSoft',
  warning: 'warningSoft',
  danger: 'dangerSoft',
  info: 'infoSoft',
  violet: 'violetSoft',
  rose: 'roseSoft',
  orange: 'orangeSoft',
};

export const toneStrongKey: Record<Tone, keyof Palette> = {
  neutral: 'textSecondary',
  accent: 'accent',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  violet: 'violet',
  rose: 'rose',
  orange: 'orange',
};
