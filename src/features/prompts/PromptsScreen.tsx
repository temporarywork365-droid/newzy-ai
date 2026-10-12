import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { CatalogLayout } from '@/components/layout/CatalogLayout';
import { Chip } from '@/components/ui/Chip';
import { FilterRow, type FilterOption } from '@/components/ui/FilterRow';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { usePrompts } from '@/hooks/queries';
import { toneForLevel } from '@/utils/labels';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import type { Level, PromptTemplate } from '@/types';

const LEVEL_FILTERS: FilterOption<'all' | Level>[] = [
  { value: 'all', label: 'All levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

function PromptCard({ prompt }: { prompt: PromptTemplate }) {
  const { spacing } = useTheme();
  return (
    <Card onPress={() => router.push(routes.prompt(prompt.id))}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Badge label={prompt.level} tone={toneForLevel(prompt.level)} />
        <AppText variant="caption" color="tertiary" style={{ flex: 1, textAlign: 'right' }}>{prompt.task}</AppText>
      </View>
      <AppText variant="heading" style={{ marginTop: spacing.sm }}>{prompt.title}</AppText>
      <AppText variant="small" color="secondary" numberOfLines={2} style={{ marginTop: spacing.xs }}>
        {prompt.intent}
      </AppText>
    </Card>
  );
}

export function PromptsScreen() {
  const { spacing } = useTheme();
  const [filter, setFilter] = useState<'all' | Level>('all');
  const query = usePrompts(filter);

  return (
    <CatalogLayout
      title="Prompt Engineering"
      subtitle="Battle-tested templates — and a Lab to upgrade your own."
      data={query.data}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => query.refetch()}
      refreshing={query.isRefetching}
      onRefresh={() => query.refetch()}
      keyExtractor={(prompt) => prompt.id}
      renderItem={({ item }) => <PromptCard prompt={item} />}
      filters={
        <View>
          <FilterRow options={LEVEL_FILTERS} value={filter} onChange={setFilter} />
          <View style={{ marginTop: spacing.sm }}>
            <Chip label="Open the Prompt Lab" icon="flask-outline" tone="accent" onPress={() => router.push('/prompt-lab')} />
          </View>
        </View>
      }
      emptyTitle="No prompts match"
      emptyMessage="Try a different level."
    />
  );
}
