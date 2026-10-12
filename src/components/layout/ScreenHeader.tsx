import type { ReactNode } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

export function ScreenHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const { spacing } = useTheme();
  return (
    <View style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <AppText variant="display">{title}</AppText>
          {subtitle ? (
            <AppText variant="small" color="secondary" style={{ marginTop: spacing.xs }}>{subtitle}</AppText>
          ) : null}
        </View>
        {right}
      </View>
    </View>
  );
}
