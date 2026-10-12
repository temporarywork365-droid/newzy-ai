import { View } from 'react-native';
import { router } from 'expo-router';
import { CatalogLayout } from '@/components/layout/CatalogLayout';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useWorkflows } from '@/hooks/queries';
import { toneForComplexity } from '@/utils/labels';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import type { Workflow } from '@/types';

function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const { spacing } = useTheme();
  return (
    <Card onPress={() => router.push(routes.workflow(workflow.id))}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Badge label={workflow.complexity} tone={toneForComplexity(workflow.complexity)} />
        <AppText variant="caption" color="tertiary" style={{ flex: 1, textAlign: 'right' }}>
          {workflow.steps.length} steps · {workflow.estimatedTime}
        </AppText>
      </View>
      <AppText variant="heading" style={{ marginTop: spacing.sm }}>{workflow.title}</AppText>
      <AppText variant="small" color="secondary" numberOfLines={2} style={{ marginTop: spacing.xs }}>
        {workflow.goal}
      </AppText>
      <AppText variant="caption" color="tertiary" style={{ marginTop: spacing.md }}>
        Requires {workflow.requiredToolIds.length} tools · {workflow.tags.join(' · ')}
      </AppText>
    </Card>
  );
}

export function WorkflowsScreen() {
  const query = useWorkflows();

  return (
    <CatalogLayout
      title="AI Workflows"
      subtitle="Goal → input → steps → output. Tap any step to open its tools and prompts."
      data={query.data}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => query.refetch()}
      refreshing={query.isRefetching}
      onRefresh={() => query.refetch()}
      keyExtractor={(workflow) => workflow.id}
      renderItem={({ item }) => <WorkflowCard workflow={item} />}
      emptyTitle="No workflows yet"
      emptyMessage="Check back soon."
    />
  );
}
