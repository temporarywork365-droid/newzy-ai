import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { ListRow } from '@/components/ui/ListRow';
import { SaveButton } from '@/components/ui/SaveButton';
import { ErrorView, LoadingView } from '@/components/ui/StateViews';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Section } from '@/components/layout/Section';
import { ContentRenderer } from '@/components/news/ContentRenderer';
import { LEVEL_LABELS } from '@/constants/taxonomy';
import { useAgentLesson } from '@/hooks/queries';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';

export function AgentLessonScreen({ id }: { id: string }) {
  const { spacing } = useTheme();
  const { data: lesson, isLoading, error, refetch } = useAgentLesson(id);

  if (isLoading) return (<Screen><DetailHeader /><LoadingView /></Screen>);
  if (error || !lesson) return (<Screen><DetailHeader /><ErrorView error={error} onRetry={() => refetch()} /></Screen>);

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <DetailHeader right={<SaveButton id={lesson.id} type="lesson" />} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Badge label={`Lesson ${String(lesson.order).padStart(2, '0')}`} tone="accent" />
        <AppText variant="caption" color="tertiary">{lesson.readMinutes} min read</AppText>
      </View>
      <AppText variant="display" style={{ marginTop: spacing.md }}>{lesson.title}</AppText>
      <AppText variant="body" color="secondary" style={{ marginTop: spacing.sm }}>{lesson.summary}</AppText>

      <View style={{ marginTop: spacing.lg }}>
        <ContentRenderer blocks={lesson.content} />
      </View>

      {lesson.relatedAgents.length > 0 && (
        <Section title="Meet the agents">
          {lesson.relatedAgents.map((agent) => (
            <ListRow
              key={agent.id}
              icon="hardware-chip-outline"
              title={agent.name}
              subtitle={agent.tagline}
              onPress={() => router.push(routes.agent(agent.id))}
            />
          ))}
        </Section>
      )}

      {lesson.relatedConcepts.length > 0 && (
        <Section title="Go deeper">
          {lesson.relatedConcepts.map((concept) => (
            <ListRow
              key={concept.id}
              icon="school-outline"
              title={concept.title}
              meta={`${LEVEL_LABELS[concept.level]} · ${concept.readMinutes} min`}
              onPress={() => router.push(routes.concept(concept.id))}
            />
          ))}
        </Section>
      )}

      {lesson.tags.length > 0 && (
        <Section title="Tags">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {lesson.tags.map((tag) => <Chip key={tag} label={tag} />)}
          </View>
        </Section>
      )}
    </Screen>
  );
}
