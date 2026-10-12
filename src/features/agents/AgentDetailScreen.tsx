import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { KeyValueGrid } from '@/components/ui/KeyValueGrid';
import { SaveButton } from '@/components/ui/SaveButton';
import { ErrorView, LoadingView } from '@/components/ui/StateViews';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Section } from '@/components/layout/Section';
import { useAgent } from '@/hooks/queries';
import { openUrl } from '@/utils/link';
import { toneForAutonomy } from '@/utils/labels';
import { useTheme } from '@/theme/ThemeProvider';

export function AgentDetailScreen({ id }: { id: string }) {
  const { spacing } = useTheme();
  const { data: agent, isLoading, error, refetch } = useAgent(id);

  if (isLoading) return (<Screen><DetailHeader /><LoadingView /></Screen>);
  if (error || !agent) return (<Screen><DetailHeader /><ErrorView error={error} onRetry={() => refetch()} /></Screen>);

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <DetailHeader right={<SaveButton id={agent.id} type="agent" />} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <AppText variant="display" style={{ flexShrink: 1 }}>{agent.name}</AppText>
        <Badge label={agent.autonomy} tone={toneForAutonomy(agent.autonomy)} />
      </View>
      <AppText variant="small" color="secondary" style={{ marginTop: spacing.xs }}>{agent.tagline}</AppText>
      <AppText variant="body" style={{ marginTop: spacing.md }}>{agent.summary}</AppText>

      <Section title="At a glance">
        <KeyValueGrid items={[
          { label: 'Category', value: agent.category },
          { label: 'Pricing', value: agent.pricingModel },
          { label: 'Autonomy', value: agent.autonomy },
          { label: 'Frameworks', value: agent.frameworks.join(' · ') },
        ]} />
      </Section>

      <Section title="Capabilities">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {agent.capabilities.map((capability) => <Chip key={capability} label={capability} />)}
        </View>
      </Section>

      <Section title="Built on">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {agent.frameworks.map((framework) => <Chip key={framework} label={framework} tone="info" />)}
        </View>
      </Section>

      <Button label="Visit website" variant="secondary" icon="open-outline" onPress={() => openUrl(agent.website)} style={{ marginTop: spacing.xl }} />
    </Screen>
  );
}
