import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { SkeletonRows } from '@/components/ui/StateViews';
import { NEWS_CATEGORY_TONE } from '@/constants/categoryTone';
import { EXPLORE_TILES } from '@/constants/exploreTiles';
import { useLiveStatusStore } from '@/store/liveStatusStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { toneSoftKey, toneStrongKey } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';
import { interaction, shadows, type Tone } from '@/theme/tokens';
import type { Article } from '@/types';
import { formatRelativeTime } from '@/utils/format';
import { localizeArticle } from '@/utils/localize';
import { routes } from '@/utils/navigation';

/* The first screen is a small dashboard: trending topics, the day's top 5, and a box for everything
   inside the app. These blocks are sized so they fit on one phone screen without scrolling. */

const TREND_TONES: Tone[] = ['violet', 'accent', 'rose', 'orange', 'info'];

/** One colorful line of trending topics. Swipe sideways for more. */
export function TrendingStrip({ topics }: { topics: { id: string; name: string }[] }) {
  const { colors, spacing } = useTheme();
  if (topics.length === 0) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: spacing.sm }}>
        <Ionicons name="flame" size={16} color={colors.orange} />
        <AppText variant="caption" color="secondary">Trending</AppText>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.lg }}
      >
        {topics.map((topic, index) => (
          <Chip
            key={topic.id}
            label={topic.name}
            tone={TREND_TONES[index % TREND_TONES.length]}
            onPress={() => router.push(routes.topic(topic.id))}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function TopFiveRow({ article, rank, isLast, titleLines }: { article: Article; rank: number; isLast: boolean; titleLines: 1 | 2 }) {
  const { colors, spacing } = useTheme();
  const language = usePreferencesStore((state) => state.language);
  const text = localizeArticle(article, language);
  const tone = NEWS_CATEGORY_TONE[article.category] ?? 'neutral';
  return (
    <Pressable
      onPress={() => router.push(routes.article(article.id))}
      accessibilityRole="button"
      accessibilityLabel={`Story ${rank}: ${text.title}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: 7,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
        opacity: pressed ? interaction.pressedOpacity : 1,
      })}
    >
      <View
        style={{
          width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
          backgroundColor: colors[toneSoftKey[tone]],
        }}
      >
        <AppText variant="caption" style={{ color: colors[toneStrongKey[tone]], fontWeight: '700' }}>{rank}</AppText>
      </View>
      <AppText
        variant="body"
        hi={text.isHindi}
        numberOfLines={titleLines}
        style={{ flex: 1, fontSize: 15, lineHeight: text.isHindi ? 25 : 20, fontWeight: '600' }}
      >
        {text.title}
      </AppText>
    </Pressable>
  );
}

/** Re-renders now and then so "3m ago" keeps counting up. */
function useTick(ms: number) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
}

const FRESH_MS = 10 * 60_000; // green dot while the last check is under 10 minutes old

/** The day's five most important stories, all visible at once. Tap a row to read it. */
export function TopFiveCard({ articles, loading, titleLines }: { articles: Article[]; loading: boolean; titleLines: 1 | 2 }) {
  const { colors, spacing, radius } = useTheme();
  const updatedAt = useLiveStatusStore((state) => state.updatedAt);
  useTick(30_000);
  const isFresh = updatedAt !== null && Date.now() - updatedAt < FRESH_MS;
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.xs,
        ...shadows.card,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isFresh ? colors.success : colors.textTertiary }} />
          <AppText variant="heading">Top 5 today</AppText>
          {updatedAt !== null ? (
            <AppText variant="caption" color="tertiary" numberOfLines={1} style={{ fontWeight: '400', flexShrink: 1 }}>
              · {formatRelativeTime(new Date(updatedAt).toISOString())}
            </AppText>
          ) : null}
        </View>
        <LanguageToggle />
      </View>
      {loading && articles.length === 0 ? (
        <SkeletonRows count={3} />
      ) : articles.length === 0 ? (
        <AppText variant="small" color="secondary" style={{ paddingVertical: spacing.lg }}>
          No stories yet. Pull down to refresh.
        </AppText>
      ) : (
        articles.map((article, index) => (
          <TopFiveRow
            key={article.id}
            article={article}
            rank={index + 1}
            isLast={index === articles.length - 1}
            titleLines={titleLines}
          />
        ))
      )}
    </View>
  );
}

/** A colorful box for every part of the app, so a new user sees what is inside straight away. */
export function ExploreGrid() {
  const { colors, spacing, radius } = useTheme();
  const rows = [EXPLORE_TILES.slice(0, 4), EXPLORE_TILES.slice(4, 8)];
  return (
    <View style={{ gap: spacing.sm }}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row', gap: spacing.sm }}>
          {row.map((tile) => (
            <Pressable
              key={tile.key}
              onPress={() => router.push(tile.route)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${tile.label}`}
              style={({ pressed }) => ({
                flex: 1,
                height: 62,
                borderRadius: radius.md,
                backgroundColor: colors[toneSoftKey[tile.tone]],
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                opacity: pressed ? interaction.pressedOpacity : 1,
              })}
            >
              <Ionicons name={tile.icon} size={22} color={colors[toneStrongKey[tile.tone]]} />
              <AppText variant="caption" numberOfLines={1} style={{ color: colors[toneStrongKey[tile.tone]] }}>
                {tile.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
