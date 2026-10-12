import { View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/AppText';
import { TOOL_CATEGORY_LABELS } from '@/constants/taxonomy';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import type { AITool } from '@/types';

export function ToolMiniCard({ tool, width = 210 }: { tool: AITool; width?: number }) {
  const { colors, spacing } = useTheme();
  return (
    <Card onPress={() => router.push(routes.tool(tool.id))} style={{ width }}>
      <AppText variant="heading" numberOfLines={1}>{tool.name}</AppText>
      <AppText variant="small" color="secondary" numberOfLines={2} style={{ marginTop: spacing.xs }}>
        {tool.tagline}
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }}>
        {tool.rating !== undefined ? (
          <>
            <Ionicons name="star" size={12} color={colors.warning} />
            <AppText variant="caption" color="secondary">{tool.rating.toFixed(1)}</AppText>
            <AppText variant="caption" color="tertiary">· </AppText>
          </>
        ) : null}
        <AppText variant="caption" color="tertiary">{TOOL_CATEGORY_LABELS[tool.category]}</AppText>
      </View>
    </Card>
  );
}
