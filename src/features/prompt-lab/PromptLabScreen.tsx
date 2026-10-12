import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { FilterRow, type FilterOption } from '@/components/ui/FilterRow';
import { ErrorView, LoadingView } from '@/components/ui/StateViews';
import { DetailHeader, HeaderIconButton } from '@/components/layout/DetailHeader';
import { Section } from '@/components/layout/Section';
import { PROMPT_LAB_CATEGORY_LABELS } from '@/constants/promptLab';
import { useAnalyzePrompt } from '@/hooks/queries';
import { usePromptHistoryStore } from '@/store/promptHistoryStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { PromptLabCategory } from '@/types/promptLab';
import { AnalysisCard } from './components/AnalysisCard';
import { PromptEditor } from './components/PromptEditor';
import { PromptResultCard } from './components/PromptResultCard';

const CATEGORY_OPTIONS: FilterOption<'auto' | PromptLabCategory>[] = [
  { value: 'auto', label: 'Auto' },
  ...(Object.keys(PROMPT_LAB_CATEGORY_LABELS) as PromptLabCategory[]).map((key) => ({
    value: key,
    label: PROMPT_LAB_CATEGORY_LABELS[key],
  })),
];

const VERSION_OPTIONS: FilterOption<'improved' | 'advanced'>[] = [
  { value: 'improved', label: 'Improved' },
  { value: 'advanced', label: 'Advanced' },
];

export function PromptLabScreen({ historyItemId }: { historyItemId?: string }) {
  const { spacing } = useTheme();
  const [input, setInput] = useState('');
  const [category, setCategory] = useState<'auto' | PromptLabCategory>('auto');
  const [version, setVersion] = useState<'improved' | 'advanced'>('improved');
  const [saved, setSaved] = useState(false);

  const analysis = useAnalyzePrompt();
  const addItem = usePromptHistoryStore((s) => s.add);

  // Load a history item: restore the input and re-run the analysis
  // (the engine is deterministic, so the result is identical).
  useEffect(() => {
    if (!historyItemId) return;
    const item = usePromptHistoryStore.getState().items.find((entry) => entry.id === historyItemId);
    if (!item) return;
    setInput(item.input);
    setCategory(item.category);
    analysis.mutate({ input: item.input, category: item.category });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyItemId]);

  const result = analysis.data;
  const canAnalyze = input.trim().length >= 3;

  const runAnalysis = () => {
    setSaved(false);
    analysis.mutate({ input: input.trim(), category: category === 'auto' ? undefined : category });
  };

  const saveToHistory = () => {
    if (!result) return;
    addItem({
      id: result.id,
      input: result.input,
      category: result.category,
      improvedPrompt: result.improvedPrompt,
      advancedPrompt: result.advancedPrompt,
      createdAt: Date.now(),
    });
    setSaved(true);
  };

  const useAsInput = (prompt: string) => {
    setInput(prompt);
    setSaved(false);
  };

  const activePrompt = version === 'improved' ? result?.improvedPrompt : result?.advancedPrompt;

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <DetailHeader
        title="Prompt Lab"
        right={
          <HeaderIconButton
            icon="time-outline"
            onPress={() => router.push('/prompt-lab/history')}
            accessibilityLabel="Prompt history"
          />
        }
      />

      {/* Prompt editor */}
      <Section title="Your prompt" style={{ marginTop: spacing.sm }}>
        <PromptEditor value={input} onChangeText={(text) => { setInput(text); setSaved(false); }} />
      </Section>

      {/* Category */}
      <Section title="Category">
        <FilterRow options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
      </Section>

      {/* Analyze */}
      <Button
        label={analysis.isPending ? 'Analyzing…' : 'Analyze prompt'}
        icon="flask-outline"
        onPress={runAnalysis}
        disabled={!canAnalyze || analysis.isPending}
      />

      {analysis.isPending && <View style={{ marginTop: spacing.md }}><LoadingView label="Analyzing your prompt" /></View>}
      {analysis.isError && (
        <View style={{ marginTop: spacing.md }}>
          <ErrorView error={analysis.error} onRetry={runAnalysis} />
        </View>
      )}

      {/* Results */}
      {result && !analysis.isPending && (
        <>
          <Section title="Analysis">
            <AnalysisCard analysis={result.analysis} />
          </Section>

          <Section title="Your upgraded prompt">
            <FilterRow options={VERSION_OPTIONS} value={version} onChange={setVersion} />
            <PromptResultCard
              title={version === 'improved' ? 'Improved prompt' : 'Advanced prompt'}
              prompt={activePrompt ?? ''}
              saved={saved}
              onSave={saveToHistory}
              onUse={() => useAsInput(activePrompt ?? '')}
            />
          </Section>

          <Section title="What changed & why">
            {result.improvements.map((improvement) => (
              <View key={improvement.area} style={{ paddingVertical: spacing.xs }}>
                <AppText variant="small" style={{ fontWeight: '700' }}>{improvement.area}</AppText>
                <AppText variant="small" color="secondary" style={{ marginTop: 2 }}>{improvement.explanation}</AppText>
              </View>
            ))}
          </Section>

          <Section title="Techniques used">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {result.techniques.map((technique) => (
                <Chip key={technique} label={technique} tone="accent" />
              ))}
            </View>
          </Section>
        </>
      )}
    </Screen>
  );
}
