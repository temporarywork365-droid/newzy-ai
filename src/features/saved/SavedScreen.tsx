import { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterRow, type FilterOption } from '@/components/ui/FilterRow';
import { ListRow } from '@/components/ui/ListRow';
import { EmptyView, SkeletonRows } from '@/components/ui/StateViews';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { HeaderIconButton } from '@/components/layout/DetailHeader';
import { ENTITY_ICONS, ENTITY_TYPE_LABELS } from '@/constants/taxonomy';
import { useSavedItems } from '@/hooks/queries';
import { useSavedStore } from '@/store/savedStore';
import { formatRelativeTime } from '@/utils/format';
import { useTheme } from '@/theme/ThemeProvider';
import type { EntityType } from '@/types';

export function SavedScreen() {
  const { spacing } = useTheme();
  const items = useSavedStore((s) => s.items);
  const remove = useSavedStore((s) => s.remove);
  const clearAll = useSavedStore((s) => s.clear);

  const resolved = useSavedItems(items);
  const [filter, setFilter] = useState<'all' | EntityType>('all');
  const [query, setQuery] = useState('');

  const all = resolved.data ?? [];
  const types = useMemo(() => [...new Set(all.map((item) => item.type))], [all]);

  const filterOptions = useMemo(
    () => [
      { value: 'all' as const, label: `All Saved (${all.length})` },
      ...types.map((type) => ({ value: type, label: ENTITY_TYPE_LABELS[type] })),
    ] as FilterOption<'all' | EntityType>[],
    [types, all.length],
  );

  const search = query.trim().toLowerCase();
  const visible = all
    .filter((item) => filter === 'all' || item.type === filter)
    .filter((item) =>
      search.length === 0
      || item.title.toLowerCase().includes(search)
      || item.subtitle.toLowerCase().includes(search),
    );

  const confirmClear = () => {
    Alert.alert('Clear saved library?', 'All bookmarks will be removed from this device. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearAll() },
    ]);
  };

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <ScreenHeader
        title="Saved Library"
        subtitle="Everything you bookmarked — searchable."
        right={items.length > 0 ? (
          <HeaderIconButton icon="trash-outline" onPress={confirmClear} accessibilityLabel="Clear saved library" />
        ) : undefined}
      />

      {items.length === 0 ? (
        <EmptyView
          icon="bookmark-outline"
          title="Nothing saved yet"
          message="Tap the bookmark icon on news, models, tools, topics, prompts, workflows or research to build your library."
        />
      ) : (
        <>
          {/* Search within the library */}
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search your saved items…"
          />

          {/* Type filters */}
          <FilterRow options={filterOptions} value={filter} onChange={setFilter} />

          {resolved.isLoading ? (
            <SkeletonRows count={3} />
          ) : visible.length === 0 ? (
            <EmptyView
              icon="search-outline"
              title="No matches"
              message={
                search.length > 0
                  ? `Nothing in your library matches "${query.trim()}".`
                  : 'No saved items in this category yet.'
              }
            />
          ) : (
            visible.map((item) => (
              <ListRow
                key={`${item.type}:${item.id}`}
                icon={ENTITY_ICONS[item.type]}
                title={item.title}
                subtitle={item.subtitle}
                meta={`Saved ${formatRelativeTime(new Date(item.savedAt).toISOString())}`}
                right={
                  <HeaderIconButton icon="close-outline" onPress={() => remove(item.id)} accessibilityLabel="Remove from saved" />
                }
                onPress={() => router.push(item.route)}
              />
            ))
          )}
        </>
      )}
    </Screen>
  );
}
