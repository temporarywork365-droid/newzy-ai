import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { FilterRow, type FilterOption } from '@/components/ui/FilterRow';
import { SearchEntry } from '@/components/ui/SearchEntry';
import { EmptyView, LoadingView, SkeletonRows } from '@/components/ui/StateViews';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { ArticleCard } from '@/components/news/ArticleCard';
import { ArticleListItem } from '@/components/news/ArticleListItem';
import { useBreakingNews, useNewsFeed, useTrendingNews, useTrendingTopics } from '@/hooks/queries';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import type { Article, NewsCategory } from '@/types';

type NewsTab = 'latest' | 'trending' | 'breaking';

const TAB_FILTERS: FilterOption<NewsTab>[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'trending', label: 'Trending' },
  { value: 'breaking', label: 'Breaking' },
];

const CATEGORY_FILTERS: FilterOption<'all' | NewsCategory>[] = [
  { value: 'all', label: 'All' },
  { value: 'ai-models', label: 'AI Models' },
  { value: 'ai-tools', label: 'AI Tools' },
  { value: 'research', label: 'Research' },
  { value: 'companies', label: 'Companies' },
  { value: 'startups', label: 'Startups' },
  { value: 'ai-agents', label: 'AI Agents' },
  { value: 'robotics', label: 'Robotics' },
  { value: 'ai-coding', label: 'AI Coding' },
  { value: 'ai-video', label: 'AI Video' },
  { value: 'ai-image', label: 'AI Image' },
  { value: 'ai-audio', label: 'AI Audio' },
  { value: 'automation', label: 'Automation' },
  { value: 'regulation', label: 'Regulation' },
  { value: 'industry', label: 'Industry' },
  { value: 'india-ai', label: 'India AI' },
];

export function NewsScreen() {
  const { colors, spacing } = useTheme();
  const [tab, setTab] = useState<NewsTab>('latest');
  const [category, setCategory] = useState<'all' | NewsCategory>('all');

  const feed = useNewsFeed(tab === 'latest' && category !== 'all' ? category : undefined);
  const trending = useTrendingNews();
  const breaking = useBreakingNews();
  const trendingTopics = useTrendingTopics();

  const feedArticles = feed.data?.pages.flatMap((page) => page.items) ?? [];
  const trendingArticles = (trending.data ?? []).filter(
    (article) => category === 'all' || article.category === category,
  );
  const breakingArticles = (breaking.data ?? []).filter(
    (article) => category === 'all' || article.category === category,
  );

  const isLoading =
    (tab === 'latest' && feed.isLoading) ||
    (tab === 'trending' && trending.isLoading) ||
    (tab === 'breaking' && breaking.isLoading);

  const isRefreshing =
    (tab === 'latest' && feed.isRefetching) ||
    (tab === 'trending' && trending.isRefetching) ||
    (tab === 'breaking' && breaking.isRefetching);

  const onRefresh = () => {
    if (tab === 'latest') feed.refetch();
    else if (tab === 'trending') trending.refetch();
    else breaking.refetch();
  };

  const data: Article[] =
    tab === 'trending' ? trendingArticles : tab === 'breaking' ? breakingArticles : feedArticles;

  const renderItem = ({ item }: { item: Article }) =>
    tab === 'trending' ? <ArticleCard article={item} /> : <ArticleListItem article={item} />;

  return (
    <Screen>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        ListHeaderComponent={
          <View>
            <ScreenHeader
              title="News"
              subtitle="The signal, without the noise."
              right={
                <Pressable
                  onPress={() => router.push('/saved')}
                  hitSlop={8}
                  accessibilityLabel="Saved news"
                  accessibilityRole="button"
                  style={{ width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name="bookmark-outline" size={20} color={colors.textPrimary} />
                </Pressable>
              }
            />
            <SearchEntry placeholder="Search all AI news…" />
            <View style={{ marginTop: spacing.md }}>
              <OfflineBanner />
            </View>
            <FilterRow options={TAB_FILTERS} value={tab} onChange={setTab} />
            {trendingTopics.data && trendingTopics.data.length > 0 && (
              <View>
                <AppText variant="caption" color="tertiary" style={{ textTransform: 'uppercase', marginTop: spacing.xs }}>
                  Related topics
                </AppText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.lg, paddingVertical: spacing.sm }}
                >
                  {trendingTopics.data.map((topic) => (
                    <Chip key={topic.id} label={topic.name} icon="pricetags-outline" onPress={() => router.push(routes.topic(topic.id))} />
                  ))}
                </ScrollView>
              </View>
            )}
            <FilterRow options={CATEGORY_FILTERS} value={category} onChange={setCategory} />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <SkeletonRows count={4} />
          ) : (
            <EmptyView
              icon="newspaper-outline"
              title="No stories here yet"
              message={category === 'all' ? 'Pull to refresh.' : 'Nothing in this category right now — try another filter.'}
            />
          )
        }
        ListFooterComponent={tab === 'latest' && feed.isFetchingNextPage ? <LoadingView label="Loading more" /> : null}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />
        }
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (tab === 'latest' && feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage();
        }}
      />
    </Screen>
  );
}
