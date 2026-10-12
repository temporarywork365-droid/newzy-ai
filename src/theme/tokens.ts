import type { TextStyle } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';
export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 } as const;
export const borderWidth = { none: 0, hairline: 1, thick: 2 } as const;

export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  title:    { fontSize: 21, lineHeight: 27, fontWeight: '700' },
  heading:  { fontSize: 17, lineHeight: 23, fontWeight: '600' },
  body:     { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  small:    { fontSize: 13, lineHeight: 19, fontWeight: '400' },
  caption:  { fontSize: 11, lineHeight: 15, fontWeight: '600' },
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
