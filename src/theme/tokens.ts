import type { TextStyle } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';
export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'violet' | 'rose' | 'orange';

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 10, md: 14, lg: 20, xl: 28, full: 999 } as const;
export const borderWidth = { none: 0, hairline: 1, thick: 2 } as const;

/* Text scale: one step bigger than before so small text is easy to read on a phone.
   "reading" is for long paragraphs (article text): larger and with more space between lines. */
export const typography = {
  display: { fontSize: 26, lineHeight: 33, fontWeight: '700' },
  title:    { fontSize: 22, lineHeight: 29, fontWeight: '700' },
  heading:  { fontSize: 18, lineHeight: 25, fontWeight: '600' },
  reading:  { fontSize: 17, lineHeight: 28, fontWeight: '400' },
  body:     { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  small:    { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption:  { fontSize: 12, lineHeight: 16, fontWeight: '600' },
} as const satisfies Record<string, TextStyle>;

/** Icon scale — every icon in the app uses one of these sizes. */
export const iconSize = { xs: 12, sm: 14, md: 18, lg: 24, xl: 32 } as const;

/** Motion durations (ms). Animations stay subtle and purposeful. */
export const motion = { fast: 150, base: 250, slow: 400 } as const;

/** Elevation levels (Android physical elevation values). */
export const elevation = { none: 0, low: 1, medium: 2, high: 3 } as const;

/** The app's single shadow language (iOS shadow props + Android elevation). */
export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: elevation.low,
  },
  raised: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: elevation.medium,
  },
} as const;

/** Component-state defaults used by every pressable/control. */
export const interaction = {
  pressedOpacity: 0.85,
  disabledOpacity: 0.5,
  hitSlop: 8,
} as const;
