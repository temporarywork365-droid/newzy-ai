import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Bullets } from '@/components/ui/Bullets';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { SaveButton } from '@/components/ui/SaveButton';
import { ErrorView, LoadingView } from '@/components/ui/StateViews';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Section } from '@/components/layout/Section';
import { useResearchPaper } from '@/hooks/queries';
import { formatDate } from '@/utils/format';
import { openUrl } from '@/utils/link';
import { useTheme } from '@/theme/ThemeProvider';

export function ResearchDetailScreen({ id }: { id: string }) {
  const { colors, spacing, radius } = useTheme();
  const { data: paper, isLoading, error, refetch } = useResearchPaper(id);

  if (isLoading) return (<Screen><DetailHeader /><LoadingView /></Screen>);
  if (error || !paper) return (<Screen><DetailHeader /><ErrorView error={error} onRetry={() => refetch()} /></Screen>);

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <DetailHeader right={<SaveButton id={paper.id} type="research" />} />

      <AppText variant="display">{paper.title}</AppText>
      <AppText variant="caption" color="tertiary" style={{ marginTop: spacing.sm }}>
        {paper.venue} · {formatDate(paper.publishedAt)}
      </AppText>

      <Section title="Authors">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {paper.authors.map((author) => <Chip key={author} label={author} small />)}
        </View>
        <AppText variant="small" color="secondary" style={{ marginTop: spacing.sm }}>
          {paper.institutions.join(' · ')}
        </AppText>
      </Section>

      <Section title="Abstract">
        <AppText variant="body" color="secondary">{paper.abstract}</AppText>
      </Section>

      <Section title="Why it matters">
        <View style={{
          backgroundColor: colors.infoSoft, borderRadius: radius.md,
          padding: spacing.md, flexDirection: 'row', gap: spacing.sm,
        }}>
          <Ionicons name="bulb-outline" size={16} color={colors.info} />
          <AppText variant="small" style={{ color: colors.info, flex: 1 }}>{paper.significance}</AppText>
        </View>
      </Section>

      <Section title="Key findings">
        <Bullets items={paper.keyFindings} />
      </Section>

      <Section title="Topics">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {paper.tags.map((tag) => <Chip key={tag} label={tag} />)}
        </View>
      </Section>

      <Button label="Read the paper" icon="open-outline" onPress={() => openUrl(paper.url)} style={{ marginTop: spacing.xl }} />
    </Screen>
  );
}
