import type { ReactNode } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { interaction, shadows } from '@/theme/tokens';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Card({ children, onPress, style, testID }: CardProps) {
  const { colors, radius, spacing } = useTheme();
  const base: StyleProp<ViewStyle> = {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card,
  };

  if (!onPress) return <View style={[base, style]} testID={testID}>{children}</View>;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      android_ripple={{ color: colors.surfaceAlt }}
      style={({ pressed }) => [base, style, pressed && { opacity: interaction.pressedOpacity }]}
    >
      {children}
    </Pressable>
  );
}
