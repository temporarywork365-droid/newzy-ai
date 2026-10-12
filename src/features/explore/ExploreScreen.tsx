import { View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { IconTile } from '@/components/ui/IconTile';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { EXPLORE_SECTIONS } from '@/constants/taxonomy';
import { useExploreOverview } from '@/hooks/queries';
import { useTheme } from '@/theme/ThemeProvider';

export function ExploreScreen() {
  const { colors, spacing } = useTheme();
  const { data: counts } = useExploreOverview();

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <ScreenHeader title="Explore" subtitle="The AI universe, organized into eight shelves." />

      {EXPLORE_SECTIONS.map((section) => (
        <Card
          key={section.key}
          onPress={() => router.push(section.route)}
          style={{ marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
        >
          <IconTile icon={section.icon} size={44} />
          <View style={{ flex: 1 }}>
            <AppText variant="heading">{section.title}</AppText>
            <AppText variant="small" color="secondary" style={{ marginTop: 2 }}>{section.description}</AppText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <AppText variant="caption" color="tertiary">{counts ? counts[section.key] : '—'}</AppText>
            <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
          </View>
        </Card>
      ))}
    </Screen>
  );
}
