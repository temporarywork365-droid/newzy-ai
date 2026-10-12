import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

export function HowItWorksSteps({ steps }: { steps: string[] }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ gap: spacing.md }}>
      {steps.map((step, index) => (
        <View key={index} style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{
            width: 24, height: 24, borderRadius: 12,
            backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center',
          }}>
            <AppText variant="caption" color="accent">{index + 1}</AppText>
          </View>
          <AppText variant="body" color="secondary" style={{ flex: 1, marginTop: 2 }}>{step}</AppText>
        </View>
      ))}
    </View>
  );
}
