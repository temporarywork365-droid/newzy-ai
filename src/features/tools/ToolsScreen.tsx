import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CatalogLayout } from '@/components/layout/CatalogLayout';
import { buildFilterOptions, FilterRow } from '@/components/ui/FilterRow';
import { SearchBar } from '@/components/ui/SearchBar';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useDebounce } from '@/hooks/useDebounce';
import { useTools } from '@/hooks/queries';
import { PRICING_MODEL_LABELS, TOOL_CATEGORY_LABELS } from '@/constants/taxonomy';
import { toneForPricing } from '@/utils/labels';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import type { AITool, PricingModel, ToolCategory } from '@/types';

function ToolCard({ tool }: { tool: AITool }) {
  const { colors, spacing } = useTheme();
  return (
    <Card onPress={() => router.push(routes.tool(tool.id))}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <AppText variant="heading" numberOfLines={1} style={{ flexShrink: 1 }}>{tool.name}</AppText>
        <Badge label={PRICING_MODEL_LABELS[tool.pricingModel]} tone={toneForPricing(tool.pricingModel)} />
      </View>
      <AppText variant="small" color="tertiary" style={{ marginTop: 2 }}>
        {tool.developer} · {TOOL_CATEGORY_LABELS[tool.category]}
      </AppText>
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
        <AppText variant="caption" color="tertiary">{tool.priceFrom}</AppText>
      </View>
    </Card>
  );
}

export function ToolsScreen() {
  const { spacing } = useTheme();
  const [pricing, setPricing] = useState<'all' | PricingModel>('all');
  const [category, setCategory] = useState<'all' | ToolCategory>('all');
  const [query, setQuery] = useState('');
  const search = useDebounce(query, 300).trim();

  // Unfiltered query powers the chips — categories come from the data.
  const directory = useTools('all', 'all', '');
  const result = useTools(pricing, category, search);

  const categoryOptions = useMemo(
    () => buildFilterOptions(directory.data?.map((tool) => tool.category), TOOL_CATEGORY_LABELS),
    [directory.data],
  );
  const pricingOptions = useMemo(
    () => buildFilterOptions(directory.data?.map((tool) => tool.pricingModel), PRICING_MODEL_LABELS),
    [directory.data],
  );

  return (
    <CatalogLayout
      title="AI Tools"
      subtitle="The apps and products actually worth your time — across 14 categories."
      data={result.data}
      isLoading={result.isLoading}
      error={result.error}
      onRetry={() => result.refetch()}
      refreshing={result.isRefetching}
      onRefresh={() => result.refetch()}
      keyExtractor={(tool) => tool.id}
      renderItem={({ item }) => <ToolCard tool={item} />}
      filters={
        <View style={{ gap: spacing.xs }}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search tools, companies, use cases…" />
          <FilterRow options={categoryOptions} value={category} onChange={setCategory} />
          <FilterRow options={pricingOptions} value={pricing} onChange={setPricing} />
        </View>
      }
      emptyTitle="No tools match"
      emptyMessage="Try a different search or filter."
    />
  );
}
