import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Bullets } from '@/components/ui/Bullets';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { KeyValueGrid } from '@/components/ui/KeyValueGrid';
import { ListRow } from '@/components/ui/ListRow';
import { SaveButton } from '@/components/ui/SaveButton';
import { ErrorView, LoadingView } from '@/components/ui/StateViews';
import { DetailHeader, HeaderIconButton } from '@/components/layout/DetailHeader';
import { Section } from '@/components/layout/Section';
import { ArticleListItem } from '@/components/news/ArticleListItem';
import {
  MODALITY_LABELS, MODEL_ACCESS_LABELS, MODEL_CATEGORY_LABELS,
} from '@/constants/taxonomy';
import { useModel } from '@/hooks/queries';
import { formatContext, formatDate, formatRelativeTime } from '@/utils/format';
import { toneForStatus } from '@/utils/labels';
import { openUrl } from '@/utils/link';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import { BenchmarkBar } from './components/BenchmarkBar';
import { CapabilityRow } from './components/CapabilityRow';
import { PricingTable } from './components/PricingTable';

export function ModelDetailScreen({ id }: { id: string }) {
  const { colors, spacing } = useTheme();
  const { data: model, isLoading, error, refetch } = useModel(id);

  if (isLoading) return (<Screen><DetailHeader /><LoadingView /></Screen>);
  if (error || !model) return (<Screen><DetailHeader /><ErrorView error={error} onRetry={() => refetch()} /></Screen>);

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <DetailHeader
        right={
          <>
            <SaveButton id={model.id} type="model" />
            <HeaderIconButton icon="open-outline" onPress={() => openUrl(model.website)} accessibilityLabel="Open official website" />
          </>
        }
      />

      {/* Overview */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
        <AppText variant="display" style={{ flexShrink: 1 }}>{model.name}</AppText>
        <Badge label={MODEL_CATEGORY_LABELS[model.category]} tone="accent" />
        <Badge label={model.status} tone={toneForStatus(model.status)} />
      </View>
      <AppText variant="small" color="secondary" style={{ marginTop: spacing.xs }}>
        {model.developerName} · {model.family}
      </AppText>
      <AppText variant="caption" color="tertiary" style={{ marginTop: spacing.xs }}>
        {model.latestVersion} · Updated {formatRelativeTime(model.updatedAt)}
      </AppText>
      <AppText variant="body" style={{ marginTop: spacing.md }}>{model.summary}</AppText>

      <Section title="At a glance">
        <KeyValueGrid items={[
          { label: 'Developer', value: model.developerName },
          { label: 'Family', value: model.family },
          { label: 'Latest version', value: model.latestVersion },
          { label: 'Updated', value: formatDate(model.updatedAt) },
          { label: 'Context window', value: model.contextWindow > 0 ? `${formatContext(model.contextWindow)} tokens` : 'Not published' },
          { label: 'Parameters', value: model.parameters },
          { label: 'License', value: model.license },
          { label: 'Modalities', value: model.modalities.map((m) => MODALITY_LABELS[m]).join(' · ') },
        ]} />
      </Section>

      {/* Availability */}
      <Section title="Availability">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {model.access.map((access) => (
            <Chip key={access} label={MODEL_ACCESS_LABELS[access]} tone="info" />
          ))}
        </View>
        <AppText variant="small" color="secondary" style={{ marginTop: spacing.sm }}>
          First released {formatDate(model.releasedAt)}.
        </AppText>
      </Section>

      {/* Capabilities */}
      <Section title="Capabilities">
        <View style={{ gap: spacing.xs }}>
          {model.capabilities.map((capability) => (
            <CapabilityRow key={capability.key} capability={capability} />
          ))}
        </View>
      </Section>

      {/* Release history */}
      <Section title="Release history">
        <View style={{ gap: spacing.xs }}>
          {model.versions.map((version) => (
            <View key={version.version} style={{ flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 6 }} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AppText variant="body" style={{ fontWeight: '600', flexShrink: 1 }}>{version.version}</AppText>
                  <AppText variant="caption" color="tertiary">{formatDate(version.releasedAt)}</AppText>
                </View>
                {version.note ? (
                  <AppText variant="small" color="secondary" style={{ marginTop: 2 }}>{version.note}</AppText>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Benchmarks">
        <View style={{ gap: spacing.md }}>
          {model.benchmarks.map((benchmark) => (
            <BenchmarkBar key={benchmark.benchmark} benchmark={benchmark} />
          ))}
        </View>
      </Section>

      <Section title="API & pricing">
        <PricingTable tiers={model.pricing} />
        <AppText variant="caption" color="tertiary" style={{ marginTop: spacing.sm }}>
          Per 1M tokens. Batch tiers apply to non-time-sensitive workloads.
        </AppText>
      </Section>

      <Section title="Use cases">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {model.useCases.map((useCase) => <Chip key={useCase} label={useCase} />)}
        </View>
      </Section>

      <Section title="Limitations">
        <Bullets items={model.limitations} tone="warning" />
      </Section>

      {model.latestUpdates.length > 0 && (
        <Section title="Latest updates">
          {model.latestUpdates.map((article) => (
            <ArticleListItem key={article.id} article={article} />
          ))}
        </Section>
      )}

      {model.relatedModels.length > 0 && (
        <Section title="Related models">
          {model.relatedModels.map((related) => (
            <ListRow
              key={related.id}
              icon="cube-outline"
              title={related.name}
              subtitle={related.developerName}
              meta={`${MODEL_CATEGORY_LABELS[related.category]} · ${related.latestVersion}`}
              onPress={() => router.push(routes.model(related.id))}
            />
          ))}
        </Section>
      )}

      {model.relatedTools.length > 0 && (
        <Section title="Works well with">
          {model.relatedTools.map((tool) => (
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

      {model.developer && (
        <Section title="Developer">
          <ListRow
            icon="business-outline"
            title={model.developer.name}
            subtitle={model.developer.tagline}
            onPress={() => router.push(routes.company(model.developer!.id))}
          />
        </Section>
      )}

      <Button label="Compare with another model" variant="secondary" icon="swap-horizontal-outline" onPress={() => router.push(routes.compare(model.id))} style={{ marginTop: spacing.xl }} />
      <Button label="Visit official source" variant="ghost" icon="open-outline" onPress={() => openUrl(model.website)} style={{ marginTop: spacing.md }} />
    </Screen>
  );
}
