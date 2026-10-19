import { View } from 'react-native';
import { router } from 'expo-router';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { AppText } from '@/components/ui/AppText';
import { CAPABILITY_LABELS, MODEL_CATEGORY_LABELS } from '@/constants/taxonomy';
import { formatContext, formatRelativeTime } from '@/utils/format';
import { toneForCapabilityLevel, toneForModelCategory } from '@/utils/labels';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import type { AIModel } from '@/types';

export function ModelCard({ model }: { model: AIModel }) {
  const { spacing } = useTheme();
  return (
    <Card onPress={() => router.push(routes.model(model.id))}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: spacing.sm, rowGap: 4, flexShrink: 1 }}>
          <AppText variant="heading" numberOfLines={1} style={{ flexShrink: 1 }}>{model.name}</AppText>
          <Badge label={MODEL_CATEGORY_LABELS[model.category]} tone={toneForModelCategory(model.category)} />
        </View>
        <AppText variant="small" color="tertiary">{formatContext(model.contextWindow)} ctx</AppText>
      </View>
      <AppText variant="small" color="tertiary" style={{ marginTop: 2 }}>
        {model.developerName} · {model.family}
      </AppText>
      <AppText variant="small" color="secondary" numberOfLines={2} style={{ marginTop: spacing.sm }}>
        {model.summary}
      </AppText>
      {model.capabilities.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm }}>
          {model.capabilities.slice(0, 3).map((capability) => (
            <Chip
              key={capability.key}
              label={CAPABILITY_LABELS[capability.key]}
              tone={toneForCapabilityLevel(capability.level)}
              small
            />
          ))}
        </View>
      )}
      <AppText variant="caption" color="tertiary" style={{ marginTop: spacing.md }}>
        {model.latestVersion} · Updated {formatRelativeTime(model.updatedAt)} · {formatContext(model.contextWindow)} ctx
      </AppText>
    </Card>
  );
}
