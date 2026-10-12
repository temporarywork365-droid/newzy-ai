import type { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useTheme } from '@/theme/ThemeProvider';

export function Section({
  title, actionLabel, onAction, children, style,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { spacing } = useTheme();
  return (
    <View style={[{ marginTop: spacing.xl }, style]}>
      <SectionHeader title={title} actionLabel={actionLabel} onAction={onAction} />
      <View style={{ marginTop: spacing.md }}>{children}</View>
    </View>
  );
}
