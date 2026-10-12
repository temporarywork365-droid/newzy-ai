import { router } from 'expo-router';
import { CatalogLayout } from '@/components/layout/CatalogLayout';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { useResearchPapers } from '@/hooks/queries';
import { formatDate } from '@/utils/format';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import type { ResearchPaper } from '@/types';

function ResearchCard({ paper }: { paper: ResearchPaper }) {
  const { spacing } = useTheme();
  return (
    <Card onPress={() => router.push(routes.research(paper.id))}>
      <AppText variant="heading" numberOfLines={3}>{paper.title}</AppText>
      <AppText variant="small" color="secondary" numberOfLines={2} style={{ marginTop: spacing.xs }}>
        {paper.institutions.join(' · ')}
      </AppText>
      <AppText variant="caption" color="tertiary" style={{ marginTop: spacing.md }}>
        {paper.venue} · {formatDate(paper.publishedAt)}
      </AppText>
    </Card>
  );
}

export function ResearchScreen() {
  const query = useResearchPapers();

  return (
    <CatalogLayout
      title="AI Research"
      subtitle="Papers that matter — explained in plain English."
      data={query.data}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => query.refetch()}
      refreshing={query.isRefetching}
      onRefresh={() => query.refetch()}
      keyExtractor={(paper) => paper.id}
      renderItem={({ item }) => <ResearchCard paper={item} />}
      emptyTitle="No papers yet"
      emptyMessage="Check back soon."
    />
  );
}
