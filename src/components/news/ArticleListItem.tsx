import { memo } from 'react';
import { Image, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { SaveButton } from '@/components/ui/SaveButton';
import { NEWS_CATEGORY_LABELS } from '@/constants/taxonomy';
import { formatRelativeTime } from '@/utils/format';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import type { Article } from '@/types';

interface ArticleListItemProps {
  article: Article;
  showSummary?: boolean;
}

function ArticleListItemBase({ article, showSummary = true }: ArticleListItemProps) {
  const { spacing, radius } = useTheme();
  return (
    <Pressable
      onPress={() => router.push(routes.article(article.id))}
      style={({ pressed }) => ({
        paddingVertical: spacing.md,
        flexDirection: 'row',
        gap: spacing.md,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ flex: 1 }}>
        <AppText variant="caption" color="accent" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
          {NEWS_CATEGORY_LABELS[article.category]}
        </AppText>
        <AppText variant="heading" style={{ marginTop: 4 }}>{article.title}</AppText>
        {showSummary ? (
          <AppText variant="small" color="secondary" numberOfLines={1} style={{ marginTop: 2 }}>
            {article.dek}
          </AppText>
        ) : null}
        <AppText variant="caption" color="tertiary" style={{ marginTop: spacing.xs }}>
          {article.source} · {formatRelativeTime(article.publishedAt)} · {article.readMinutes} min
        </AppText>
      </View>
      {article.imageUrl ? (
        <Image
          source={{ uri: article.imageUrl }}
          resizeMode="cover"
          fadeDuration={250}
          style={{ width: 64, height: 64, borderRadius: radius.md }}
        />
      ) : null}
      <SaveButton id={article.id} type="article" compact />
    </Pressable>
  );
}

export const ArticleListItem = memo(ArticleListItemBase);
