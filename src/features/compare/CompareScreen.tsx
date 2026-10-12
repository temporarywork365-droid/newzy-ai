import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ListRow } from '@/components/ui/ListRow';
import { EmptyView, ErrorView, LoadingView } from '@/components/ui/StateViews';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Section } from '@/components/layout/Section';
import { MODALITY_LABELS, MODEL_ACCESS_LABELS, MODEL_CATEGORY_LABELS } from '@/constants/taxonomy';
import { useModels } from '@/hooks/queries';
import { formatContext } from '@/utils/format';
import { toneForStatus } from '@/utils/labels';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import type { AIModel } from '@/types';

export function CompareScreen({ initialLeftId }: { initialLeftId?: string }) {
  const { colors, spacing, radius } = useTheme();
  const { data: models, isLoading, error, refetch } = useModels('all');

  const [leftId, setLeftId] = useState<string | undefined>(initialLeftId);
  const [rightId, setRightId] = useState<string | undefined>(undefined);
  const [pickingFor, setPickingFor] = useState<'left' | 'right' | null>(null);

  const left = models?.find((m) => m.id === leftId);
  const right = models?.find((m) => m.id === rightId);

  const rows = useMemo(() => {
    if (!left || !right) return [];
    const price = (m: AIModel) =>
      m.pricing[0] ? `$${m.pricing[0].inputPerMTok} / $${m.pricing[0].outputPerMTok}` : '—';
    return [
      { label: 'Developer', left: left.developerName, right: right.developerName },
      { label: 'Category', left: MODEL_CATEGORY_LABELS[left.category], right: MODEL_CATEGORY_LABELS[right.category] },
      { label: 'Status', left: left.status, right: right.status },
      { label: 'Latest version', left: left.latestVersion, right: right.latestVersion },
      { label: 'Context', left: `${formatContext(left.contextWindow)} tok`, right: `${formatContext(right.contextWindow)} tok` },
      { label: 'Parameters', left: left.parameters, right: right.parameters },
      { label: 'Modalities', left: left.modalities.map((m) => MODALITY_LABELS[m]).join(', '), right: right.modalities.map((m) => MODALITY_LABELS[m]).join(', ') },
      { label: 'Access', left: left.access.map((a) => MODEL_ACCESS_LABELS[a]).join(', '), right: right.access.map((a) => MODEL_ACCESS_LABELS[a]).join(', ') },
      { label: 'Price in / out (1M)', left: price(left), right: price(right) },
    ];
  }, [left, right]);

  if (isLoading) return (<Screen><DetailHeader title="Compare models" /><LoadingView /></Screen>);
  if (error) return (<Screen><DetailHeader title="Compare models" /><ErrorView error={error} onRetry={() => refetch()} /></Screen>);

  const pick = (model: AIModel) => {
    if (pickingFor === 'left') setLeftId(model.id);
    if (pickingFor === 'right') setRightId(model.id);
    setPickingFor(null);
  };

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <DetailHeader title="Compare models" />

      {/* Selection slots */}
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <ModelSlot model={left} label="Model A" onPress={() => setPickingFor('left')} />
        <ModelSlot model={right} label="Model B" onPress={() => setPickingFor('right')} />
      </View>

      {left && right ? (
        <>
          <Section title="Side by side">
            <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}>
                <AppText variant="caption" color="tertiary" style={{ flex: 1 }}>Attribute</AppText>
                <AppText variant="caption" color="tertiary" style={{ flex: 1.2, textAlign: 'center' }} numberOfLines={1}>{left.name}</AppText>
                <AppText variant="caption" color="tertiary" style={{ flex: 1.2, textAlign: 'center' }} numberOfLines={1}>{right.name}</AppText>
              </View>
              {rows.map((row) => (
                <View key={row.label} style={{ flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <AppText variant="small" color="secondary" style={{ flex: 1 }}>{row.label}</AppText>
                  <AppText variant="small" style={{ flex: 1.2, textAlign: 'center' }}>{row.left}</AppText>
                  <AppText variant="small" style={{ flex: 1.2, textAlign: 'center' }}>{row.right}</AppText>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Open profiles">
            <ListRow icon="cube-outline" title={left.name} subtitle={left.developerName} onPress={() => router.push(routes.model(left.id))} />
            <ListRow icon="cube-outline" title={right.name} subtitle={right.developerName} onPress={() => router.push(routes.model(right.id))} />
          </Section>
        </>
      ) : (
        <Section title="How it works">
          <EmptyView
            icon="swap-horizontal-outline"
            title="Pick two models"
            message="Select a model in each slot to compare context, pricing, modalities and more — side by side."
          />
        </Section>
      )}

      {/* Model picker (Android back button closes it via onRequestClose) */}
      <Modal visible={pickingFor !== null} animationType="slide" onRequestClose={() => setPickingFor(null)}>
        <Screen>
          <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <AppText variant="title">{pickingFor === 'left' ? 'Select Model A' : 'Select Model B'}</AppText>
            <Button label="Close" variant="ghost" onPress={() => setPickingFor(null)} />
          </View>
          <FlatList
            data={models ?? []}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <ListRow
                icon="cube-outline"
                title={item.name}
                subtitle={item.developerName}
                meta={`${formatContext(item.contextWindow)} tokens · ${item.status}`}
                onPress={() => pick(item)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
          />
        </Screen>
      </Modal>
    </Screen>
  );
}

function ModelSlot({ model, label, onPress }: { model?: AIModel; label: string; onPress: () => void }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Select ${label}`}
      style={({ pressed }) => [{
        flex: 1, backgroundColor: colors.surface,
        borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
        padding: spacing.md, alignItems: 'center', gap: spacing.xs,
        opacity: pressed ? 0.85 : 1,
      }]}
    >
      <AppText variant="caption" color="tertiary" style={{ textTransform: 'uppercase' }}>{label}</AppText>
      {model ? (
        <>
          <AppText variant="heading" numberOfLines={1}>{model.name}</AppText>
          <Badge label={model.status} tone={toneForStatus(model.status)} />
        </>
      ) : (
        <>
          <View style={{ width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
            <AppText variant="heading" color="accent">+</AppText>
          </View>
          <AppText variant="small" color="secondary">Select model</AppText>
        </>
      )}
    </Pressable>
  );
}
