import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import type { PricingTier } from '@/types';

export function PricingTable({ tiers }: { tiers: PricingTier[] }) {
  const { spacing } = useTheme();
  return (
    <View style={{ gap: spacing.md }}>
      {tiers.map((tier) => (
        <View key={tier.tier} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <AppText variant="body" style={{ fontWeight: '600' }}>{tier.tier}</AppText>
          <AppText variant="small" color="secondary">
            ${tier.inputPerMTok} in · ${tier.outputPerMTok} out{' '}
            <AppText variant="caption" color="tertiary">/ 1M tokens</AppText>
          </AppText>
        </View>
      ))}
    </View>
  );
}
