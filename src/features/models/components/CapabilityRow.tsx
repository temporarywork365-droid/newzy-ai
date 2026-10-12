import { View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { AppText } from '@/components/ui/AppText';
import { CAPABILITY_LABELS, CAPABILITY_LEVEL_LABELS } from '@/constants/taxonomy';
import { toneForCapabilityLevel } from '@/utils/labels';
import { useTheme } from '@/theme/ThemeProvider';
import type { ModelCapability } from '@/types';

export function CapabilityRow({ capability }: { capability: ModelCapability }) {
  const { spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs }}>
      <View style={{ flex: 1 }}>
        <AppText variant="body" style={{ fontWeight: '600' }}>{CAPABILITY_LABELS[capability.key]}</AppText>
        {capability.note ? (
          <AppText variant="small" color="secondary" style={{ marginTop: 2 }}>{capability.note}</AppText>
        ) : null}
      </View>
      <Badge label={CAPABILITY_LEVEL_LABELS[capability.level]} tone={toneForCapabilityLevel(capability.level)} />
    </View>
  );
}
