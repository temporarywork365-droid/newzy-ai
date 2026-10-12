import type { ReactNode } from 'react';
import { FlatList, RefreshControl, SectionList, View, type ListRenderItem } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { EmptyView, ErrorView, SkeletonRows } from '@/components/ui/StateViews';
import { ScreenHeader } from './ScreenHeader';
import { useTheme } from '@/theme/ThemeProvider';

export interface CatalogSection<T> { title: string; data: T[]; }

export interface CatalogLayoutProps<T> {
  title: string;
  subtitle?: string;
  /** Flat list mode. */
  data?: T[];
  /** Grouped mode (e.g. Learn AI's Beginner/Intermediate/Advanced). */
  sections?: CatalogSection<T>[];
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  keyExtractor: (item: T) => string;
  renderItem: ListRenderItem<T>;
  filters?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
}

const LIST_PERF_PROPS = {
  initialNumToRender: 10,
  maxToRenderPerBatch: 10,
  windowSize: 7,
  removeClippedSubviews: true,
} as const;

/**
 * Shared list-screen shell used by every Explore section —
 * one place to get loading, error, empty, refresh and layout right.
 */
export function CatalogLayout<T>({
  title, subtitle, data, sections, isLoading, error, onRetry,
  keyExtractor, renderItem, filters, onRefresh, refreshing,
  emptyTitle = 'Nothing here yet', emptyMessage = 'Check back soon.',
}: CatalogLayoutProps<T>) {
  const { colors, spacing } = useTheme();

  const totalItems = sections
    ? sections.reduce((sum, section) => sum + section.data.length, 0)
    : (data ?? []).length;

  const ListHeader = (
    <View>
      <ScreenHeader title={title} subtitle={subtitle} />
      {filters}
    </View>
  );
  const ListEmpty = isLoading ? (
    <SkeletonRows count={4} />
  ) : error ? (
    <ErrorView error={error} onRetry={onRetry} />
  ) : (
    <EmptyView icon="folder-open-outline" title={emptyTitle} message={emptyMessage} />
  );
  const refreshControl = onRefresh ? (
    <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />
  ) : undefined;

  // Grouped mode with content
  if (sections && totalItems > 0) {
    return (
      <Screen>
        <SectionList
          sections={sections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <View style={{ paddingTop: spacing.lg, paddingBottom: spacing.sm, backgroundColor: colors.background }}>
              <AppText variant="title">{section.title}</AppText>
            </View>
          )}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
          refreshControl={refreshControl}
          stickySectionHeadersEnabled={false}
          {...LIST_PERF_PROPS}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={data ?? []}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 }}
        refreshControl={refreshControl}
        {...LIST_PERF_PROPS}
      />
    </Screen>
  );
}
