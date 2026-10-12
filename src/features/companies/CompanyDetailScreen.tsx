import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Bullets } from '@/components/ui/Bullets';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { KeyValueGrid } from '@/components/ui/KeyValueGrid';
import { ListRow } from '@/components/ui/ListRow';
import { SaveButton } from '@/components/ui/SaveButton';
import { ErrorView, LoadingView } from '@/components/ui/StateViews';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Section } from '@/components/layout/Section';
import { useCompany } from '@/hooks/queries';
import { formatDate } from '@/utils/format';
import { openUrl } from '@/utils/link';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';

export function CompanyDetailScreen({ id }: { id: string }) {
  const { spacing } = useTheme();
  const { data: company, isLoading, error, refetch } = useCompany(id);

  if (isLoading) return (<Screen><DetailHeader /><LoadingView /></Screen>);
  if (error || !company) return (<Screen><DetailHeader /><ErrorView error={error} onRetry={() => refetch()} /></Screen>);

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <DetailHeader right={<SaveButton id={company.id} type="company" />} />

      <AppText variant="display">{company.name}</AppText>
      <AppText variant="small" color="secondary" style={{ marginTop: spacing.xs }}>{company.tagline}</AppText>
      <AppText variant="body" style={{ marginTop: spacing.md }}>{company.summary}</AppText>

      <Section title="At a glance">
        <KeyValueGrid items={[
          { label: 'Founded', value: String(company.founded) },
          { label: 'HQ', value: company.hq },
          { label: 'Employees', value: company.employees },
          { label: 'Total raised', value: company.funding.totalRaised },
        ]} />
      </Section>

      <Section title="Founders">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {company.founders.map((founder) => <Chip key={founder} label={founder} />)}
        </View>
      </Section>

      <Section title="Focus areas">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {company.focus.map((area) => <Chip key={area} label={area} tone="info" />)}
        </View>
      </Section>

      <Section title="Funding">
        <KeyValueGrid items={[
          { label: 'Last round', value: company.funding.lastRound },
          { label: 'Last round date', value: company.funding.lastRoundAt ? formatDate(company.funding.lastRoundAt) : '—' },
        ]} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
          {company.funding.investors.map((investor) => <Chip key={investor} label={investor} small />)}
        </View>
      </Section>

      <Section title="Key products">
        <Bullets items={company.keyProducts} />
      </Section>

      {company.models.length > 0 && (
        <Section title="Notable models">
          {company.models.map((model) => (
            <ListRow
              key={model.id}
              icon="cube-outline"
              title={model.name}
              meta={`${model.developerName} · ${model.status}`}
              onPress={() => router.push(routes.model(model.id))}
            />
          ))}
        </Section>
      )}

      <Button label="Visit website" variant="secondary" icon="open-outline" onPress={() => openUrl(company.website)} style={{ marginTop: spacing.xl }} />
    </Screen>
  );
}
