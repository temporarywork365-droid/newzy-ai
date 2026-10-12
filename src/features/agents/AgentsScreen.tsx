import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { FilterRow, buildFilterOptions } from '@/components/ui/FilterRow';
import { SkeletonRows } from '@/components/ui/StateViews';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Section } from '@/components/layout/Section';
import { useAgentLessons, useAgents } from '@/hooks/queries';
import { toneForAutonomy } from '@/utils/labels';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import type { AgentLesson, AgentProfile, Autonomy } from '@/types';

function LessonCard({ lesson }: { lesson: AgentLesson }) {
  const { spacing, radius, colors } = useTheme();
  return (
    <Card onPress={() => router.push(routes.lesson(lesson.id))} style={{ width: 230 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <View style={{
          width: 26, height: 26, borderRadius: 13,
          backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center',
        }}>
          <AppText variant="caption" color="accent">{lesson.order}</AppText>
        </View>
        <AppText variant="caption" color="tertiary">
          LESSON {String(lesson.order).padStart(2, '0')} · {lesson.readMinutes} MIN
        </AppText>
      </View>
      <AppText variant="heading" numberOfLines={2} style={{ marginTop: spacing.sm }}>{lesson.title}</AppText>
      <AppText variant="small" color="secondary" numberOfLines={2} style={{ marginTop: spacing.xs }}>
        {lesson.summary}
      </AppText>
    </Card>
  );
}

function AgentCard({ agent }: { agent: AgentProfile }) {
  const { spacing } = useTheme();
  return (
    <Card onPress={() => router.push(routes.agent(agent.id))}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <AppText variant="heading" numberOfLines={1} style={{ flexShrink: 1 }}>{agent.name}</AppText>
        <Badge label={agent.autonomy} tone={toneForAutonomy(agent.autonomy)} />
      </View>
      <AppText variant="small" color="secondary" numberOfLines={2} style={{ marginTop: spacing.xs }}>
        {agent.tagline}
      </AppText>
      <AppText variant="caption" color="tertiary" style={{ marginTop: spacing.md }}>
        {agent.category} · {agent.pricingModel}
      </AppText>
    </Card>
  );
}

export function AgentsScreen() {
  const { spacing } = useTheme();
  const [autonomy, setAutonomy] = useState<'all' | Autonomy>('all');

  const directory = useAgents('all');
  const result = useAgents(autonomy);
  const lessons = useAgentLessons();

  const autonomyOptions = useMemo(
    () => buildFilterOptions(directory.data?.map((agent) => agent.autonomy), {
      assisted: 'Assisted', 'semi-autonomous': 'Semi-autonomous', autonomous: 'Autonomous',
    }),
    [directory.data],
  );

  return (
    <Screen
      scroll
      refresh={{ refreshing: result.isRefetching || lessons.isRefetching, onRefresh: () => { result.refetch(); lessons.refetch(); } }}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
    >
      <ScreenHeader title="AI Agents" subtitle="Learn how agents work — then meet the ones worth knowing." />

      <Section title="Agent Academy" style={{ marginTop: spacing.md }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.lg }}>
          {lessons.data?.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </ScrollView>
      </Section>

      <Section title="Agent directory">
        <FilterRow options={autonomyOptions} value={autonomy} onChange={setAutonomy} />
        {result.isLoading ? (
          <SkeletonRows count={3} />
        ) : (
          result.data?.map((agent) => <AgentCard key={agent.id} agent={agent} />)
        )}
      </Section>
    </Screen>
  );
}
