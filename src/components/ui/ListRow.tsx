import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

export interface ListRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  meta?: string;
  right?: ReactNode;
  onPress?: () => void;
}

export function ListRow({ icon, title, subtitle, meta, right, onPress }: ListRowProps) {
  const { colors, spacing, radius } = useTheme();
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: spacing.md,
        paddingVertical: spacing.md, opacity: pressed ? 0.7 : 1,
      })}
    >
      {icon ? (
        <View style={{
          width: 40, height: 40, borderRadius: radius.md,
          backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name={icon} size={18} color={colors.accent} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <AppText variant="heading" numberOfLines={2}>{title}</AppText>
        {subtitle ? <AppText variant="small" color="secondary" numberOfLines={2} style={{ marginTop: 2 }}>{subtitle}</AppText> : null}
        {meta ? <AppText variant="caption" color="tertiary" style={{ marginTop: 4 }}>{meta}</AppText> : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} /> : null)}
    </Pressable>
  );
}
