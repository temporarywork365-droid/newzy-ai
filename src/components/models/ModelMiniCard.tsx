import { View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/AppText';
import { MODEL_CATEGORY_LABELS } from '@/constants/taxonomy';
import { formatContext } from '@/utils/format';
import { toneForModelCategory } from '@/utils/labels';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import type { AIModel } from '@/types';

export function ModelMiniCard({ model }: { model: AIModel }) {
  const { colors, spacing } = useTheme();
  return (
    <Card onPress={() => router.push(routes.model(model.id))} style={{ width: 230 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: spacing.sm, rowGap: 4 }}>
        <AppText variant="heading" numberOfLines={1} style={{ flexShrink: 1 }}>{model.name}</AppText>
        <Badge label={MODEL_CATEGORY_LABELS[model.category]} tone={toneForModelCategory(model.category)} />
      </View>
      <AppText variant="caption" color="tertiary" style={{ marginTop: 2 }}>{model.developerName}</AppText>
      <AppText variant="small" color="secondary" numberOfLines={2} style={{ marginTop: spacing.sm }}>
        {model.summary}
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }}>
        <Ionicons name="resize-outline" size={12} color={colors.textTertiary} />
        <AppText variant="caption" color="tertiary">
          {formatContext(model.contextWindow)} ctx · {model.latestVersion}
        </AppText>
      </View>
    </Card>
  );
}
