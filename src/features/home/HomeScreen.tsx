import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FilterRow, type FilterOption } from '@/components/ui/FilterRow';
import { SearchEntry } from '@/components/ui/SearchEntry';
import { SkeletonRows } from '@/components/ui/StateViews';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { ListRow } from '@/components/ui/ListRow';
import { ArticleCard } from '@/components/news/ArticleCard';
import { ArticleListItem } from '@/components/news/ArticleListItem';
import { ModelMiniCard } from '@/components/models/ModelMiniCard';
import { ToolMiniCard } from '@/components/tools/ToolMiniCard';
import { INTEREST_LABELS } from '@/constants/interests';
import { EXPLORE_SECTIONS, LEARNING_TRACK_LABELS } from '@/constants/taxonomy';
import { personalizeArticles } from '@/features/personalization/recommendationEngine';
import {
  useBreakingNews, useDailyDigest, useFeaturedConcepts, useFeaturedNews,
  useForYouNews, useLatestNews, useTrendingModels, useTrendingTools,
  useTrendingTopics, useWorkflows,
} from '@/hooks/queries';
import { useInterestsStore } from '@/store/interestsStore';
import { formatRelativeTime, formatToday } from '@/utils/format';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import { shadows } from '@/theme/tokens';
import type { Article, DailyDigest, NewsCategory } from '@/types';

const NEWS_FILTERS: FilterOption<'all' | NewsCategory>[] = [
  { value: 'all', label: 'All' },
  { value: 'ai-models', label: 'Models' },
  { value: 'ai-tools', label: 'Tools' },
  { value: 'research', label: 'Research' },
  { value: 'startups', label: 'Startups' },
  { value: 'regulation', label: 'Regulation' },
  { value: 'india-ai', label: 'India AI' },
];

function BreakingBanner({ article }: { article: Article }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <Pressable
      onPress={() => router.push(routes.article(article.id))}
      accessibilityRole="button"
      style={({ pressed }) => [{
        flexDirection: 'row', alignItems: 'center', gap: spacing.md,
        backgroundColor: colors.dangerSoft, borderLeftWidth: 3, borderLeftColor: colors.danger,
        borderRadius: radius.md, padding: spacing.md, paddingRight: spacing.lg,
        opacity: pressed ? 0.85 : 1,
      }]}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Badge label="Breaking" tone="danger" />
          <AppText variant="caption" color="tertiary">{formatRelativeTime(article.publishedAt)}</AppText>
        </View>
        <AppText variant="heading" numberOfLines={2} style={{ marginTop: spacing.xs }}>{article.title}</AppText>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.danger} />
    </Pressable>
  );
}

function TodayCard({ digest }: { digest: DailyDigest }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <Card onPress={() => router.push(routes.article(digest.topStoryId))} style={shadows.raised}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="caption" color="accent" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Today's AI</AppText>
        <AppText variant="caption" color="tertiary">{formatToday()}</AppText>
      </View>
      <AppText variant="title" style={{ marginTop: spacing.sm }}>{digest.headline}</AppText>
      <AppText variant="small" color="secondary" numberOfLines={3} style={{ marginTop: spacing.xs }}>
        {digest.summary}
      </AppText>
      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
        {digest.stats.map((stat) => (
          <View key={stat.label} style={{ flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs }}>
            <AppText variant="heading" style={{ textAlign: 'center' }}>{stat.value}</AppText>
            <AppText variant="caption" color="tertiary" style={{ textAlign: 'center', marginTop: 2 }}>{stat.label}</AppText>
          </View>
        ))}
      </View>
      <AppText variant="caption" color="accent" style={{ marginTop: spacing.md }}>Read the top story →</AppText>
    </Card>
  );
}

function PersonalizeBanner({ onPress }: { onPress: () => void }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Personalize your feed"
      style={{
        backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accent,
        borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Ionicons name="sparkles-outline" size={16} color={colors.accent} />
        <AppText variant="heading">Personalize your feed</AppText>
      </View>
      <AppText variant="small" color="secondary">
        Pick your interests and Home will surface what matters to you — news, tools and topics.
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs }}>
        <AppText variant="caption" color="accent">Choose interests</AppText>
        <Ionicons name="chevron-forward" size={12} color={colors.accent} />
      </View>
    </Pressable>
  );
}

export function HomeScreen() {
  const { colors, spacing } = useTheme();
  const [category, setCategory] = useState<'all' | NewsCategory>('all');

  const digest = useDailyDigest();
  const breaking = useBreakingNews();
  const featured = useFeaturedNews();
  const latest = useLatestNews(category === 'all' ? undefined : category);
  const trendingModels = useTrendingModels();
  const trendingTools = useTrendingTools();
  const trendingTopics = useTrendingTopics();
  const learn = useFeaturedConcepts();
  const workflows = useWorkflows();

  // Personalization
  const interests = useInterestsStore((s) => s.interests);
  const interestsHydrated = useInterestsStore((s) => s.hasHydrated);
  const forYouPool = useForYouNews();
  const forYouArticles = useMemo(
    () => personalizeArticles(forYouPool.data ?? [], interests, 5),
    [forYouPool.data, interests],
  );
  const hasInterests = interestsHydrated && interests.length > 0;

  const refreshing =
    digest.isRefetching || breaking.isRefetching || featured.isRefetching ||
    latest.isRefetching || trendingModels.isRefetching || trendingTools.isRefetching ||
    trendingTopics.isRefetching || learn.isRefetching || workflows.isRefetching;

  const onRefresh = () => {
    digest.refetch(); breaking.refetch(); featured.refetch(); latest.refetch();
    trendingModels.refetch(); trendingTools.refetch(); trendingTopics.refetch();
    learn.refetch(); workflows.refetch(); forYouPool.refetch();
  };

  return (
    <Screen scroll refresh={{ refreshing, onRefresh }} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      {/* Brand + interests + settings */}
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row' }}>
          <AppText variant="display">Newzy</AppText>
          <AppText variant="display" color="accent"> AI</AppText>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Pressable
            onPress={() => router.push('/interests')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Edit interests"
            style={{ width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="person-outline" size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            style={{ width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Search + offline */}
      <SearchEntry />
      <View style={{ marginTop: spacing.md }}>
        <OfflineBanner />
      </View>

      {/* Breaking / important updates */}
      {breaking.data && breaking.data.length > 0 && (
        <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
          {breaking.data.slice(0, 2).map((article) => (
            <BreakingBanner key={article.id} article={article} />
          ))}
        </View>
      )}

      {/* Today's AI */}
      {digest.data && <TodayCard digest={digest.data} />}

      {/* For You (personalized) or onboarding banner */}
      {hasInterests ? (
        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title="For You" actionLabel="Edit" onAction={() => router.push('/interests')} />
          <AppText variant="caption" color="tertiary" style={{ marginTop: spacing.xs }}>
            Based on: {interests.slice(0, 3).map((key) => INTEREST_LABELS[key]).join(', ')}
            {interests.length > 3 ? ` +${interests.length - 3}` : ''}
          </AppText>
          {forYouPool.isLoading ? (
            <SkeletonRows count={2} />
          ) : forYouArticles.length > 0 ? (
            forYouArticles.map((article) => (
              <ArticleListItem key={article.id} article={article} />
            ))
          ) : (
            <AppText variant="small" color="secondary" style={{ marginTop: spacing.md }}>
              Nothing matched your interests today — the latest stories are below.
            </AppText>
          )}
        </View>
      ) : interestsHydrated ? (
        <View style={{ marginTop: spacing.lg }}>
          <PersonalizeBanner onPress={() => router.push('/interests')} />
        </View>
      ) : null}

      {/* Trending topics */}
      {trendingTopics.data && trendingTopics.data.length > 0 && (
        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title="Trending topics" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.lg, paddingTop: spacing.sm }}>
            {trendingTopics.data.map((topic) => (
              <Chip key={topic.id} label={topic.name} icon="trending-up-outline" onPress={() => router.push(routes.topic(topic.id))} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Featured */}
      {featured.data && featured.data.length > 0 && (
        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title="Featured" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.lg, paddingTop: spacing.md }}>
            {featured.data.map((article) => (
              <ArticleCard key={article.id} article={article} width={320} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Latest news */}
      <View style={{ marginTop: spacing.xl }}>
        <SectionHeader title="Latest news" actionLabel="See all" onAction={() => router.push('/news')} />
        <FilterRow options={NEWS_FILTERS} value={category} onChange={setCategory} />
        {latest.isLoading ? (
          <SkeletonRows count={3} />
        ) : (
          latest.data?.map((article) => <ArticleListItem key={article.id} article={article} />)
        )}
      </View>

      {/* Models */}
      <View style={{ marginTop: spacing.xl }}>
        <SectionHeader title="Trending models" actionLabel="See all" onAction={() => router.push('/explore/models')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.lg, paddingTop: spacing.md }}>
          {trendingModels.data?.map((model) => (
            <ModelMiniCard key={model.id} model={model} />
          ))}
        </ScrollView>
      </View>

      {/* Tools */}
      <View style={{ marginTop: spacing.xl }}>
        <SectionHeader title="AI tools to know" actionLabel="See all" onAction={() => router.push('/explore/tools')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.lg, paddingTop: spacing.md }}>
          {trendingTools.data?.map((tool) => (
            <ToolMiniCard key={tool.id} tool={tool} />
          ))}
        </ScrollView>
      </View>

      {/* Continue learning */}
      <View style={{ marginTop: spacing.xl }}>
        <SectionHeader title="Keep learning" actionLabel="Browse" onAction={() => router.push('/explore/learn')} />
        {learn.data?.map((concept) => (
          <ListRow
            key={concept.id}
            icon="book-outline"
            title={concept.title}
            meta={`${LEARNING_TRACK_LABELS[concept.track]} · ${concept.readMinutes} min · ${concept.level}`}
            onPress={() => router.push(routes.concept(concept.id))}
          />
        ))}
      </View>

      {/* Recommended workflows */}
      <View style={{ marginTop: spacing.xl }}>
        <SectionHeader title="Recommended workflows" actionLabel="See all" onAction={() => router.push('/explore/workflows')} />
        {workflows.data?.slice(0, 2).map((workflow) => (
          <ListRow
            key={workflow.id}
            icon="git-network-outline"
            title={workflow.title}
            subtitle={workflow.goal}
            meta={`${workflow.complexity} · ${workflow.steps.length} steps · ${workflow.estimatedTime}`}
            onPress={() => router.push(routes.workflow(workflow.id))}
          />
        ))}
      </View>

      {/* Jump back in */}
      <View style={{ marginTop: spacing.xl }}>
        <SectionHeader title="Jump back in" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <Chip label="Prompt Lab" icon="flask-outline" tone="accent" onPress={() => router.push('/prompt-lab')} />
          {EXPLORE_SECTIONS.filter((section) => ['prompts', 'workflows', 'agents', 'research'].includes(section.key)).map((section) => (
            <Chip key={section.key} label={section.title} icon={section.icon} onPress={() => router.push(section.route)} />
          ))}
        </View>
      </View>
    </Screen>
  );
}
