import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

export function AnalogyCard({ text }: { text: string }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View style={{ backgroundColor: colors.accentSoft, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Ionicons name="bulb-outline" size={14} color={colors.accent} />
        <AppText variant="caption" color="accent" style={{ textTransform: 'uppercase' }}>Think of it like</AppText>
      </View>
      <AppText variant="body" color="secondary" style={{ fontStyle: 'italic' }}>{text}</AppText>
    </View>
  );
}
