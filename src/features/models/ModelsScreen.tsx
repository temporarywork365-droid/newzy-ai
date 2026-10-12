import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { CatalogLayout } from '@/components/layout/CatalogLayout';
import { buildFilterOptions, FilterRow, type FilterOption } from '@/components/ui/FilterRow';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { MODALITY_LABELS, MODEL_CATEGORY_LABELS } from '@/constants/taxonomy';
import { useDebounce } from '@/hooks/useDebounce';
import { useModels } from '@/hooks/queries';
import { useTheme } from '@/theme/ThemeProvider';
import type { Modality, ModelCategory } from '@/types';
import { ModelCard } from './components/ModelCard';

export function ModelsScreen() {
  const { spacing } = useTheme();
  const [category, setCategory] = useState<'all' | ModelCategory>('all');
  const [modality, setModality] = useState<'all' | Modality>('all');
  const [query, setQuery] = useState('');
  const search = useDebounce(query, 300).trim();

  // Unfiltered query powers the filter chips (taxonomy comes from the data).
  const directory = useModels('all', 'all', '');
  const result = useModels(modality, category, search);

  const categoryOptions = useMemo(
    () => buildFilterOptions(directory.data?.map((model) => model.category), MODEL_CATEGORY_LABELS),
    [directory.data],
  );

  const modalityOptions: FilterOption<'all' | Modality>[] = useMemo(() => {
    const present = [...new Set((directory.data ?? []).flatMap((model) => model.modalities))];
    return [
      { value: 'all', label: 'All' },
      ...present.map((value) => ({ value, label: MODALITY_LABELS[value] })),
    ];
  }, [directory.data]);

  return (
    <CatalogLayout
      title="AI Models"
      subtitle="Capabilities, benchmarks, versions and pricing — every major release."
      data={result.data}
      isLoading={result.isLoading}
      error={result.error}
      onRetry={() => result.refetch()}
      refreshing={result.isRefetching}
      onRefresh={() => result.refetch()}
      keyExtractor={(model) => model.id}
      renderItem={({ item }) => <ModelCard model={item} />}
      filters={
        <View style={{ gap: spacing.xs }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search models, developers, families…"
          />
          <FilterRow options={categoryOptions} value={category} onChange={setCategory} />
          <FilterRow options={modalityOptions} value={modality} onChange={setModality} />
          <View style={{ marginTop: spacing.sm }}>
            <Chip label="Compare models" icon="swap-horizontal-outline" tone="accent" onPress={() => router.push('/compare')} />
          </View>
        </View>
      }
      emptyTitle="No models match"
      emptyMessage="Try a different search or filter."
    />
  );
}
