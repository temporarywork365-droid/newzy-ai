import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Bullets } from '@/components/ui/Bullets';
import { Chip } from '@/components/ui/Chip';
import { ListRow } from '@/components/ui/ListRow';
import { SaveButton } from '@/components/ui/SaveButton';
import { ErrorView, LoadingView } from '@/components/ui/StateViews';
import { DetailHeader, HeaderIconButton } from '@/components/layout/DetailHeader';
import { Section } from '@/components/layout/Section';
import { useWorkflow } from '@/hooks/queries';
import { toneForComplexity } from '@/utils/labels';
import { routes } from '@/utils/navigation';
import { buildWorkflowShareText, shareText } from '@/utils/share';
import { useTheme } from '@/theme/ThemeProvider';
import { WorkflowFlow } from './components/WorkflowFlow';

export function WorkflowDetailScreen({ id }: { id: string }) {
  const { spacing } = useTheme();
  const { data: workflow, isLoading, error, refetch } = useWorkflow(id);

  if (isLoading) return (<Screen><DetailHeader /><LoadingView /></Screen>);
  if (error || !workflow) return (<Screen><DetailHeader /><ErrorView error={error} onRetry={() => refetch()} /></Screen>);

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <DetailHeader
        right={
          <>
            <SaveButton id={workflow.id} type="workflow" />
            <HeaderIconButton
              icon="share-social-outline"
              onPress={() => shareText(buildWorkflowShareText(workflow))}
              accessibilityLabel="Share workflow"
            />
          </>
        }
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
        <Badge label={workflow.complexity} tone={toneForComplexity(workflow.complexity)} />
        <Chip label={workflow.estimatedTime} icon="time-outline" small />
        <Chip label={`${workflow.steps.length} steps`} icon="list-outline" small />
      </View>
      <AppText variant="display" style={{ marginTop: spacing.md }}>{workflow.title}</AppText>
      <AppText variant="body" color="secondary" style={{ marginTop: spacing.sm }}>{workflow.goal}</AppText>

      {/* GOAL → INPUT → STEPS → OUTPUT */}
      <Section title="The flow">
        <WorkflowFlow
          workflow={workflow}
          onOpenTool={(toolId) => router.push(routes.tool(toolId))}
          onOpenPrompt={(promptId) => router.push(routes.prompt(promptId))}
        />
      </Section>

      <Section title="Automation opportunities">
        <Bullets items={workflow.automationOpportunities} tone="success" />
      </Section>

      {workflow.tools.length > 0 && (
        <Section title="Required tools">
          {workflow.tools.map((tool) => (
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

      {workflow.prompts.length > 0 && (
        <Section title="Prompts used">
          {workflow.prompts.map((prompt) => (
            <ListRow
              key={prompt.id}
              icon="chatbubble-ellipses-outline"
              title={prompt.title}
              subtitle={prompt.task}
              onPress={() => router.push(routes.prompt(prompt.id))}
            />
          ))}
        </Section>
      )}

      <Section title="Alternatives">
        <Bullets items={workflow.alternatives} tone="info" />
      </Section>

      <Section title="Limitations">
        <Bullets items={workflow.limitations} tone="warning" />
      </Section>

      {workflow.tags.length > 0 && (
        <Section title="Tags">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {workflow.tags.map((tag) => <Chip key={tag} label={tag} />)}
          </View>
        </Section>
      )}
    </Screen>
  );
}
