import { Image, View } from 'react-native';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { SaveButton } from '@/components/ui/SaveButton';
import { NEWS_CATEGORY_LABELS } from '@/constants/taxonomy';
import { usePreferencesStore } from '@/store/preferencesStore';
import { localizeArticle } from '@/utils/localize';
import { formatRelativeTime } from '@/utils/format';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import type { Article } from '@/types';

export function ArticleCard({ article, width }: { article: Article; width?: number }) {
  const { radius, spacing } = useTheme();
  const language = usePreferencesStore((state) => state.language);
  const text = localizeArticle(article, language);
  return (
    <Card onPress={() => router.push(routes.article(article.id))} style={{ width: width ?? '100%', padding: 0 }}>
      {article.imageUrl ? (
        <Image
          source={{ uri: article.imageUrl }}
          resizeMode="cover"
          fadeDuration={250}
          style={{ height: 150, width: '100%', borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}
        />
      ) : null}
      <View style={{ padding: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <Badge label={NEWS_CATEGORY_LABELS[article.category]} tone="accent" />
          <AppText variant="caption" color="tertiary" style={{ flex: 1, textAlign: 'right' }}>
            {article.readMinutes} min read
          </AppText>
        </View>
        <AppText variant="title" hi={text.isHindi}>{text.title}</AppText>
        <AppText variant="small" color="secondary" hi={text.isHindi} numberOfLines={3} style={{ marginTop: spacing.sm }}>
          {text.dek}
        </AppText>
        {article.tags.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm }}>
            {article.tags.slice(0, 3).map((tag) => (
              <Chip key={tag} label={tag} small />
            ))}
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md }}>
          <AppText variant="caption" color="tertiary">
            {article.source} · {formatRelativeTime(article.publishedAt)}
          </AppText>
          <SaveButton id={article.id} type="article" compact />
        </View>
      </View>
    </Card>
  );
}
