import { Image, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Bullets } from '@/components/ui/Bullets';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ListRow } from '@/components/ui/ListRow';
import { SaveButton } from '@/components/ui/SaveButton';
import { ErrorView, LoadingView } from '@/components/ui/StateViews';
import { DetailHeader, HeaderIconButton } from '@/components/layout/DetailHeader';
import { Section } from '@/components/layout/Section';
import { ArticleListItem } from '@/components/news/ArticleListItem';
import { NEWS_CATEGORY_LABELS } from '@/constants/taxonomy';
import { useArticle } from '@/hooks/queries';
import { formatDate, formatRelativeTime } from '@/utils/format';
import { openUrl } from '@/utils/link';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';

export function ArticleDetailScreen({ id }: { id: string }) {
  const { colors, spacing, radius } = useTheme();
  const { data: article, isLoading, error, refetch } = useArticle(id);

  if (isLoading) return (<Screen><DetailHeader /><LoadingView /></Screen>);
  if (error || !article) return (<Screen><DetailHeader /><ErrorView error={error} onRetry={() => refetch()} /></Screen>);

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <DetailHeader
        right={
          <>
            <SaveButton id={article.id} type="article" />
            <HeaderIconButton icon="open-outline" onPress={() => openUrl(article.sourceUrl)} accessibilityLabel="Open original source" />
          </>
        }
      />

      {/* Hero */}
      {article.imageUrl ? (
        <Image
          source={{ uri: article.imageUrl }}
          resizeMode="cover"
          fadeDuration={250}
          style={{ height: 190, width: '100%', borderRadius: radius.lg, marginBottom: spacing.md }}
        />
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Badge label={NEWS_CATEGORY_LABELS[article.category]} tone="accent" />
        <AppText variant="caption" color="tertiary">{article.readMinutes} min read</AppText>
      </View>
      <AppText variant="display" style={{ marginTop: spacing.md }}>{article.title}</AppText>
      <AppText variant="body" color="secondary" style={{ marginTop: spacing.sm }}>{article.summary}</AppText>
      <AppText variant="caption" color="tertiary" style={{ marginTop: spacing.md }}>
        {article.source} · Summarized by {article.author} · {formatDate(article.publishedAt)} ({formatRelativeTime(article.publishedAt)})
      </AppText>

      {/* FACTS — What happened? */}
      <Section title="What happened?">
        <AppText variant="body">{article.whatHappened}</AppText>
      </Section>

      {/* FACTS — Important details */}
      <Section title="Important details">
        <Bullets items={article.importantDetails} />
      </Section>

      {/* ANALYSIS — visually distinct from facts */}
      <Section title="Why it matters">
        <View style={{ backgroundColor: colors.accentSoft, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="bulb-outline" size={14} color={colors.accent} />
            <AppText variant="caption" color="accent" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Analysis · Newzy AI
            </AppText>
          </View>
          <AppText variant="body" color="secondary">{article.whyItMatters}</AppText>
        </View>
      </Section>

      {/* Related topics */}
      {article.relatedTopics.length > 0 && (
        <Section title="Related topics">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {article.relatedTopics.map((topic) => (
              <Chip key={topic.id} label={topic.name} icon="pricetags-outline" onPress={() => router.push(routes.topic(topic.id))} />
            ))}
          </View>
        </Section>
      )}

      {/* Related models */}
      {article.relatedModels.length > 0 && (
        <Section title="Related models">
          {article.relatedModels.map((model) => (
            <ListRow
              key={model.id}
              icon="cube-outline"
              title={model.name}
              subtitle={model.developerName}
              onPress={() => router.push(routes.model(model.id))}
            />
          ))}
        </Section>
      )}

      {/* Related tools */}
      {article.relatedTools.length > 0 && (
        <Section title="Related tools">
          {article.relatedTools.map((tool) => (
            <ListRow
              key={tool.id}
              icon="construct-outline"
              title={tool.name}
              subtitle={tool.tagline}
              onPress={() => router.push(routes.tool(tool.id))}
            />
          ))}
        </Section>
      )}

      {/* Related stories */}
      {article.related.length > 0 && (
        <Section title="Related stories">
          {article.related.map((related) => (
            <ArticleListItem key={related.id} article={related} />
          ))}
        </Section>
      )}

      {/* Original source — full attribution */}
      <Section title="Original source">
        <Card>
          <AppText variant="heading">{article.source}</AppText>
          <AppText variant="small" color="secondary" style={{ marginTop: spacing.xs }}>
            Published {formatDate(article.publishedAt)}
          </AppText>
          <AppText variant="caption" color="tertiary" numberOfLines={1} style={{ marginTop: spacing.xs }}>
            {article.sourceUrl}
          </AppText>
          <Button
            label="Read the original article"
            variant="secondary"
            icon="open-outline"
            onPress={() => openUrl(article.sourceUrl)}
            style={{ marginTop: spacing.md }}
          />
        </Card>
        <AppText variant="caption" color="tertiary" style={{ marginTop: spacing.sm, textAlign: 'center' }}>
          Summary and analysis written by Newzy AI. Facts from original reporting by {article.source}.
        </AppText>
      </Section>

      {/* Tags */}
      {article.tags.length > 0 && (
        <Section title="Topics">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {article.tags.map((tag) => (
              <Chip key={tag} label={tag} />
            ))}
          </View>
        </Section>
      )}
    </Screen>
  );
}
