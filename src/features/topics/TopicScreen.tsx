import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { SaveButton } from '@/components/ui/SaveButton';
import { Chip } from '@/components/ui/Chip';
import { KeyValueGrid } from '@/components/ui/KeyValueGrid';
import { ListRow } from '@/components/ui/ListRow';
import { ModelMiniCard } from '@/components/models/ModelMiniCard';
import { ErrorView, LoadingView } from '@/components/ui/StateViews';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Section } from '@/components/layout/Section';
import { ArticleListItem } from '@/components/news/ArticleListItem';
import { useTopic } from '@/hooks/queries';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';

export function TopicScreen({ id }: { id: string }) {
  const { spacing } = useTheme();
  const { data: topic, isLoading, error, refetch } = useTopic(id);

  if (isLoading) return (<Screen><DetailHeader /><LoadingView /></Screen>);
  if (error || !topic) return (<Screen><DetailHeader /><ErrorView error={error} onRetry={() => refetch()} /></Screen>);

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <DetailHeader right={<SaveButton id={topic.id} type="topic" />} />

      <AppText variant="caption" color="accent" style={{ textTransform: 'uppercase' }}>Topic</AppText>
      <AppText variant="display" style={{ marginTop: spacing.xs }}>{topic.name}</AppText>
      <AppText variant="body" color="secondary" style={{ marginTop: spacing.sm }}>{topic.tagline}</AppText>
      <AppText variant="small" color="secondary" style={{ marginTop: spacing.md }}>{topic.description}</AppText>

      <Section title="Coverage">
        <KeyValueGrid items={[
          { label: 'Stories', value: String(topic.stats.articles) },
          { label: 'Models', value: String(topic.stats.models) },
          { label: 'Tools', value: String(topic.stats.tools) },
          { label: 'Papers', value: String(topic.stats.research) },
        ]} />
      </Section>

      {topic.articles.length > 0 && (
        <Section title="Top stories">
          {topic.articles.map((article) => (
            <ArticleListItem key={article.id} article={article} />
          ))}
        </Section>
      )}

      {topic.models.length > 0 && (
        <Section title="Models to know">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.lg }}>
            {topic.models.map((model) => (
              <ModelMiniCard key={model.id} model={model} />
            ))}
          </ScrollView>
        </Section>
      )}

      {topic.tools.length > 0 && (
        <Section title="Tools in this space">
          {topic.tools.map((tool) => (
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

      {topic.research.length > 0 && (
        <Section title="Foundational papers">
          {topic.research.map((paper) => (
            <ListRow
              key={paper.id}
              icon="flask-outline"
              title={paper.title}
              subtitle={paper.venue}
              onPress={() => router.push(routes.research(paper.id))}
            />
          ))}
        </Section>
      )}

      {topic.tags.length > 0 && (
        <Section title="Related tags">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {topic.tags.map((tag) => (
              <Chip key={tag} label={tag} />
            ))}
          </View>
        </Section>
      )}
    </Screen>
  );
}
