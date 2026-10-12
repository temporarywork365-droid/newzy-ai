import { View } from 'react-native';
import { router } from 'expo-router';
import { CatalogLayout } from '@/components/layout/CatalogLayout';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { useCompanies } from '@/hooks/queries';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import type { Company } from '@/types';

function CompanyCard({ company }: { company: Company }) {
  const { spacing } = useTheme();
  return (
    <Card onPress={() => router.push(routes.company(company.id))}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
        <AppText variant="heading" numberOfLines={1} style={{ flexShrink: 1 }}>{company.name}</AppText>
        <AppText variant="caption" color="tertiary">{company.funding.totalRaised}</AppText>
      </View>
      <AppText variant="small" color="secondary" numberOfLines={2} style={{ marginTop: spacing.xs }}>
        {company.tagline}
      </AppText>
      <AppText variant="caption" color="tertiary" style={{ marginTop: spacing.md }}>
        Founded {company.founded} · {company.hq}
      </AppText>
    </Card>
  );
}

export function CompaniesScreen() {
  const query = useCompanies();

  return (
    <CatalogLayout
      title="AI Companies"
      subtitle="Labs, startups and the money behind them."
      data={query.data}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => query.refetch()}
      refreshing={query.isRefetching}
      onRefresh={() => query.refetch()}
      keyExtractor={(company) => company.id}
      renderItem={({ item }) => <CompanyCard company={item} />}
      emptyTitle="No companies yet"
      emptyMessage="Check back soon."
    />
  );
}
