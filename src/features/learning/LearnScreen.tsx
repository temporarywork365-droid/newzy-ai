import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { CatalogLayout, type CatalogSection } from '@/components/layout/CatalogLayout';
import { buildFilterOptions, FilterRow } from '@/components/ui/FilterRow';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { LEARNING_TRACK_LABELS, LEVEL_LABELS } from '@/constants/taxonomy';
import { useConcepts } from '@/hooks/queries';
import { toneForLevel } from '@/utils/labels';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import type { Concept, Level } from '@/types';

function ConceptCard({ concept }: { concept: Concept }) {
  const { spacing } = useTheme();
  return (
    <Card onPress={() => router.push(routes.concept(concept.id))}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Badge label={concept.level} tone={toneForLevel(concept.level)} />
        <AppText variant="caption" color="tertiary" style={{ flex: 1, textAlign: 'right' }}>
          {concept.readMinutes} min read
        </AppText>
      </View>
      <AppText variant="heading" style={{ marginTop: spacing.sm }}>{concept.title}</AppText>
      <AppText variant="small" color="secondary" numberOfLines={2} style={{ marginTop: spacing.xs }}>
        {concept.definition}
      </AppText>
      <AppText variant="caption" color="tertiary" style={{ marginTop: spacing.md }}>
        {LEARNING_TRACK_LABELS[concept.track]}
      </AppText>
    </Card>
  );
}

export function LearnScreen() {
  const [level, setLevel] = useState<'all' | Level>('all');

  // Unfiltered query powers the filter chips (taxonomy comes from the data).
  const directory = useConcepts('all');
  const result = useConcepts(level);

  const levelOptions = useMemo(
    () => buildFilterOptions(directory.data?.map((concept) => concept.level), LEVEL_LABELS),
    [directory.data],
  );

  const sections = useMemo<CatalogSection<Concept>[]>(() => {
    const items = result.data ?? [];
    if (level !== 'all') return [{ title: LEVEL_LABELS[level], data: items }];
    const order: Level[] = ['beginner', 'intermediate', 'advanced'];
    return order
      .map((lvl) => ({ title: LEVEL_LABELS[lvl], data: items.filter((concept) => concept.level === lvl) }))
      .filter((section) => section.data.length > 0);
  }, [result.data, level]);

  return (
    <CatalogLayout
      title="Learn AI"
      subtitle="A complete path from first principles to the frontier — 27 topics, 3 levels."
      data={result.data}
      sections={sections}
      isLoading={result.isLoading}
      error={result.error}
      onRetry={() => result.refetch()}
      refreshing={result.isRefetching}
      onRefresh={() => result.refetch()}
      keyExtractor={(concept) => concept.id}
      renderItem={({ item }) => <ConceptCard concept={item} />}
      filters={<FilterRow options={levelOptions} value={level} onChange={setLevel} />}
      emptyTitle="No topics match"
      emptyMessage="Try another level."
    />
  );
}
