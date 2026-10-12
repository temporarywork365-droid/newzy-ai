import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Bullets } from '@/components/ui/Bullets';
import { ListRow } from '@/components/ui/ListRow';
import { SaveButton } from '@/components/ui/SaveButton';
import { ErrorView, LoadingView } from '@/components/ui/StateViews';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Section } from '@/components/layout/Section';
import { ArticleListItem } from '@/components/news/ArticleListItem';
import { LEARNING_TRACK_LABELS, LEVEL_LABELS } from '@/constants/taxonomy';
import { useConcept } from '@/hooks/queries';
import { toneForLevel } from '@/utils/labels';
import { openUrl } from '@/utils/link';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import { AnalogyCard } from './components/AnalogyCard';
import { HowItWorksSteps } from './components/HowItWorksSteps';
import { KnowledgeGraphView } from './components/KnowledgeGraphView';

export function ConceptDetailScreen({ id }: { id: string }) {
  const { spacing } = useTheme();
  const { data: concept, isLoading, error, refetch } = useConcept(id);

  if (isLoading) return (<Screen><DetailHeader /><LoadingView /></Screen>);
  if (error || !concept) return (<Screen><DetailHeader /><ErrorView error={error} onRetry={() => refetch()} /></Screen>);

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <DetailHeader right={<SaveButton id={concept.id} type="concept" />} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Badge label={concept.level} tone={toneForLevel(concept.level)} />
        <AppText variant="caption" color="tertiary" style={{ textTransform: 'uppercase' }}>
          {LEARNING_TRACK_LABELS[concept.track]}
        </AppText>
      </View>
      <AppText variant="display" style={{ marginTop: spacing.md }}>{concept.title}</AppText>
      <AppText variant="caption" color="tertiary" style={{ marginTop: spacing.xs }}>
        {concept.readMinutes} min read
      </AppText>

      {/* 1. Definition */}
      <Section title="Definition">
        <AppText variant="body" style={{ fontWeight: '600' }}>{concept.definition}</AppText>
      </Section>

      {/* 2. Simple explanation */}
      <Section title="In simple terms">
        <AppText variant="body" color="secondary">{concept.simpleExplanation}</AppText>
      </Section>

      {/* 3. Detailed explanation */}
      <Section title="In depth">
        <AppText variant="body" color="secondary">{concept.detailedExplanation}</AppText>
      </Section>

      {/* 4. Analogy */}
      <Section title="Analogy">
        <AnalogyCard text={concept.analogy} />
      </Section>

      {/* 5. Example */}
      <Section title="Example">
        <AppText variant="body" color="secondary">{concept.example}</AppText>
      </Section>

      {/* 6. How it works */}
      <Section title="How it works">
        <HowItWorksSteps steps={concept.howItWorks} />
      </Section>

      {/* 7. Real-world applications */}
      <Section title="Real-world applications">
        <Bullets items={concept.applications} />
      </Section>

      {/* 8. Advantages */}
      <Section title="Advantages">
        <Bullets items={concept.advantages} tone="success" />
      </Section>

      {/* 9. Limitations */}
      <Section title="Limitations">
        <Bullets items={concept.limitations} tone="warning" />
      </Section>

      {/* 10. Latest developments */}
      {concept.latestDevelopments.length > 0 && (
        <Section title="Latest developments">
          {concept.latestDevelopments.map((article) => (
            <ArticleListItem key={article.id} article={article} />
          ))}
        </Section>
      )}

      {/* 11. Related topics — the knowledge graph */}
      {concept.related.length > 0 && (
        <Section title="Knowledge graph">
          <KnowledgeGraphView
            topics={concept.related.map((related) => ({ id: related.id, title: related.title }))}
            onTopicPress={(topicId) => router.push(routes.concept(topicId))}
          />
        </Section>
      )}
      {concept.related.length > 0 && (
        <Section title="Continue learning">
          {concept.related.map((related) => (
            <ListRow
              key={related.id}
              icon="school-outline"
              title={related.title}
              meta={`${LEVEL_LABELS[related.level]} · ${related.readMinutes} min`}
              onPress={() => router.push(routes.concept(related.id))}
            />
          ))}
        </Section>
      )}

      {/* 12. Sources */}
      {concept.sources.length > 0 && (
        <Section title="Sources">
          {concept.sources.map((source) => (
            <ListRow key={source.url} icon="open-outline" title={source.title} onPress={() => openUrl(source.url)} />
          ))}
        </Section>
      )}
    </Screen>
  );
}
