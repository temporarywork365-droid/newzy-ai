import { View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Bullets } from '@/components/ui/Bullets';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/AppText';
import { PROMPT_LAB_CATEGORY_LABELS } from '@/constants/promptLab';
import { useTheme } from '@/theme/ThemeProvider';
import type { AnalysisDimension, AnalysisDimensionKey, PromptAnalysis } from '@/types/promptLab';

const DIMENSION_LABELS: Record<AnalysisDimensionKey, string> = {
  role: 'Role', context: 'Context', task: 'Task', constraints: 'Constraints',
  input: 'Input', examples: 'Examples', 'output-format': 'Output format',
};

function BlockLabel({ children }: { children: string }) {
  return (
    <AppText variant="caption" color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
      {children}
    </AppText>
  );
}

export function AnalysisCard({ analysis }: { analysis: PromptAnalysis }) {
  const { spacing } = useTheme();
  const scoreTone = analysis.score >= 70 ? 'success' : analysis.score >= 40 ? 'warning' : 'danger';

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="heading">Prompt score</AppText>
        <Badge label={`${analysis.score}/100`} tone={scoreTone} />
      </View>
      <AppText variant="small" color="secondary" style={{ marginTop: spacing.xs }}>
        {PROMPT_LAB_CATEGORY_LABELS[analysis.category]}
        {analysis.categoryAutoDetected ? ' (auto-detected)' : ''} · 9-dimension analysis
      </AppText>

      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
        {analysis.dimensions.map((dimension: AnalysisDimension) => (
          <View key={dimension.key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <AppText variant="small" style={{ fontWeight: '600' }}>{DIMENSION_LABELS[dimension.key]}</AppText>
              <AppText variant="small" color="secondary" style={{ marginTop: 2 }}>{dimension.note}</AppText>
            </View>
            <Badge label={dimension.present ? 'Present' : 'Missing'} tone={dimension.present ? 'success' : 'warning'} />
          </View>
        ))}
      </View>

      {analysis.ambiguities.length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          <BlockLabel>Potential ambiguity</BlockLabel>
          <View style={{ marginTop: spacing.sm }}>
            <Bullets items={analysis.ambiguities} tone="warning" />
          </View>
        </View>
      )}

      {analysis.missingInfo.length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          <BlockLabel>Missing information</BlockLabel>
          <View style={{ marginTop: spacing.sm }}>
            <Bullets items={analysis.missingInfo} tone="info" />
          </View>
        </View>
      )}

      {analysis.structureNotes.length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          <BlockLabel>Structure</BlockLabel>
          {analysis.structureNotes.map((note) => (
            <AppText key={note} variant="small" color="secondary" style={{ marginTop: 2 }}>• {note}</AppText>
          ))}
        </View>
      )}
    </Card>
  );
}
