import { View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Bullets } from '@/components/ui/Bullets';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { KeyValueGrid } from '@/components/ui/KeyValueGrid';
import { ListRow } from '@/components/ui/ListRow';
import { SaveButton } from '@/components/ui/SaveButton';
import { ErrorView, LoadingView } from '@/components/ui/StateViews';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Section } from '@/components/layout/Section';
import { ArticleListItem } from '@/components/news/ArticleListItem';
import { PRICING_MODEL_LABELS, TOOL_CATEGORY_LABELS } from '@/constants/taxonomy';
import { useTool } from '@/hooks/queries';
import { toneForPricing } from '@/utils/labels';
import { openUrl } from '@/utils/link';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';

export function ToolDetailScreen({ id }: { id: string }) {
  const { colors, spacing } = useTheme();
  const { data: tool, isLoading, error, refetch } = useTool(id);

  if (isLoading) return (<Screen><DetailHeader /><LoadingView /></Screen>);
  if (error || !tool) return (<Screen><DetailHeader /><ErrorView error={error} onRetry={() => refetch()} /></Screen>);

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <DetailHeader right={<SaveButton id={tool.id} type="tool" />} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm }}>
        <AppText variant="display" style={{ flexShrink: 1 }}>{tool.name}</AppText>
        <Badge label={PRICING_MODEL_LABELS[tool.pricingModel]} tone={toneForPricing(tool.pricingModel)} />
      </View>
      <AppText variant="small" color="secondary" style={{ marginTop: spacing.xs }}>{tool.tagline}</AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm }}>
        {tool.rating !== undefined ? (
          <>
            <Ionicons name="star" size={14} color={colors.warning} />
            <AppText variant="small">{tool.rating.toFixed(1)}</AppText>
          </>
        ) : null}
        <AppText variant="caption" color="tertiary">
          {tool.rating !== undefined ? '· ' : ''}{tool.developer} · {tool.platforms.join(', ')}
        </AppText>
      </View>

      <Section title="About">
        <AppText variant="body">{tool.summary}</AppText>
      </Section>

      <Section title="Key facts">
        <KeyValueGrid items={[
          { label: 'Category', value: TOOL_CATEGORY_LABELS[tool.category] },
          { label: 'Pricing', value: PRICING_MODEL_LABELS[tool.pricingModel] },
          { label: 'Price from', value: tool.priceFrom },
          { label: 'Rating', value: tool.rating !== undefined ? `${tool.rating.toFixed(1)} / 5` : 'Not rated' },
        ]} />
      </Section>

      <Section title="Main features">
        <Bullets items={tool.features} />
      </Section>

      <Section title="Use cases">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {tool.bestFor.map((useCase) => <Chip key={useCase} label={useCase} />)}
        </View>
      </Section>

      <Section title="Platforms">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {tool.platforms.map((platform) => <Chip key={platform} label={platform.toUpperCase()} tone="info" />)}
        </View>
      </Section>

      <Section title="Integrations">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {tool.integrations.map((integration) => <Chip key={integration} label={integration} />)}
        </View>
      </Section>

      {tool.latestUpdates.length > 0 && (
        <Section title="Latest updates">
          {tool.latestUpdates.map((article) => (
            <ArticleListItem key={article.id} article={article} />
          ))}
        </Section>
      )}

      {tool.related.length > 0 && (
        <Section title="Related tools">
          {tool.related.map((related) => (
            <ListRow
              key={related.id}
              icon="construct-outline"
              title={related.name}
              subtitle={related.tagline}
              onPress={() => router.push(routes.tool(related.id))}
            />
          ))}
        </Section>
      )}

      <Button label="Visit website" variant="secondary" icon="open-outline" onPress={() => openUrl(tool.website)} style={{ marginTop: spacing.xl }} />
    </Screen>
  );
}
