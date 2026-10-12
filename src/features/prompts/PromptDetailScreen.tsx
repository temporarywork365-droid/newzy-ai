import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Bullets } from '@/components/ui/Bullets';
import { Chip } from '@/components/ui/Chip';
import { CopyButton } from '@/components/ui/CopyButton';
import { SaveButton } from '@/components/ui/SaveButton';
import { ErrorView, LoadingView } from '@/components/ui/StateViews';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Section } from '@/components/layout/Section';
import { usePrompt } from '@/hooks/queries';
import { toneForLevel } from '@/utils/labels';
import { useTheme } from '@/theme/ThemeProvider';
import { TemplateBlock } from './components/TemplateBlock';

export function PromptDetailScreen({ id }: { id: string }) {
  const { spacing } = useTheme();
  const { data: prompt, isLoading, error, refetch } = usePrompt(id);

  if (isLoading) return (<Screen><DetailHeader /><LoadingView /></Screen>);
  if (error || !prompt) return (<Screen><DetailHeader /><ErrorView error={error} onRetry={() => refetch()} /></Screen>);

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <DetailHeader right={<SaveButton id={prompt.id} type="prompt" />} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Badge label={prompt.level} tone={toneForLevel(prompt.level)} />
        <AppText variant="caption" color="tertiary">{prompt.task}</AppText>
      </View>
      <AppText variant="display" style={{ marginTop: spacing.md }}>{prompt.title}</AppText>
      <AppText variant="body" color="secondary" style={{ marginTop: spacing.sm }}>{prompt.intent}</AppText>

      <Section title="Recommended models">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {prompt.models.map((model) => <Chip key={model} label={model} tone="info" />)}
        </View>
      </Section>

      <Section title="Template">
        <TemplateBlock template={prompt.template} />
        <CopyButton text={prompt.template} label="Copy template" style={{ marginTop: spacing.md }} />
      </Section>

      <Section title="Variables">
        <View style={{ gap: spacing.md }}>
          {prompt.variables.map((variable) => (
            <View key={variable.name}>
              <AppText variant="small" style={{ fontWeight: '700' }}>{variable.name}</AppText>
              <AppText variant="small" color="secondary" style={{ marginTop: 2 }}>{variable.description}</AppText>
              <AppText variant="caption" color="tertiary" style={{ marginTop: 2, fontStyle: 'italic' }}>
                e.g. {variable.example}
              </AppText>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Tips">
        <Bullets items={prompt.tips} />
      </Section>

      {prompt.example ? (
        <Section title="Example">
          <AppText variant="caption" color="tertiary" style={{ textTransform: 'uppercase', marginBottom: spacing.xs }}>Input</AppText>
          <TemplateBlock template={prompt.example.input} />
          <AppText variant="caption" color="tertiary" style={{ textTransform: 'uppercase', marginTop: spacing.md, marginBottom: spacing.xs }}>Output</AppText>
          <TemplateBlock template={prompt.example.output} />
        </Section>
      ) : null}

      {prompt.tags.length > 0 && (
        <Section title="Tags">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {prompt.tags.map((tag) => <Chip key={tag} label={tag} />)}
          </View>
        </Section>
      )}
    </Screen>
  );
}
