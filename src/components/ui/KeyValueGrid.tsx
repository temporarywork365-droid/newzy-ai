import { View } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '@/theme/ThemeProvider';

export interface StatItem { label: string; value: string; }

export function KeyValueGrid({ items }: { items: StatItem[] }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {items.map((item) => (
        <View
          key={item.label}
          style={{
            flexBasis: '47%', flexGrow: 1,
            backgroundColor: colors.surfaceAlt, borderRadius: radius.md,
            paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
          }}
        >
          <AppText variant="caption" color="tertiary" style={{ textTransform: 'uppercase' }}>{item.label}</AppText>
          <AppText variant="body" style={{ fontWeight: '600', marginTop: 2 }}>{item.value}</AppText>
        </View>
      ))}
    </View>
  );
}
