import type { ReactNode } from 'react';
import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { typography } from '@/theme/tokens';

type Variant = keyof typeof typography;
type ColorKey = 'primary' | 'secondary' | 'tertiary' | 'accent';

const COLOR_KEY: Record<ColorKey, 'textPrimary' | 'textSecondary' | 'textTertiary' | 'accent'> = {
  primary: 'textPrimary',
  secondary: 'textSecondary',
  tertiary: 'textTertiary',
  accent: 'accent',
};

export interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: ColorKey;
  /** Devanagari (Hindi) needs more vertical room than Latin text. */
  hi?: boolean;
  children?: ReactNode;
}

export function AppText({ variant = 'body', color = 'primary', hi = false, style, children, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  const hindiLine = hi ? { lineHeight: Math.round(typography[variant].lineHeight * 1.25) } : null;
  return (
    <Text {...rest} style={[typography[variant], hindiLine, { color: colors[COLOR_KEY[color]] }, style] as StyleProp<TextStyle>}>
      {children}
    </Text>
  );
}
