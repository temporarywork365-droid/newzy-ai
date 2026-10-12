import { View } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { toneStrongKey } from '@/theme/colors';
import type { Tone } from '@/theme/tokens';

export function Bullets({ items, tone = 'accent' }: { items: string[]; tone?: Tone }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      {items.map((item, index) => (
        <View key={index} style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors[toneStrongKey[tone]], marginTop: 8 }} />
          <AppText variant="body" color="secondary" style={{ flex: 1 }}>{item}</AppText>
        </View>
      ))}
    </View>
  );
}
