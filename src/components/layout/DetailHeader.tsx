import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

export function DetailHeader({ title, right }: { title?: string; right?: ReactNode }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingBottom: spacing.lg, paddingTop: spacing.sm }}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityLabel="Go back"
        style={{
          width: 36, height: 36, borderRadius: radius.full,
          backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
      </Pressable>
      {title ? <AppText variant="heading" numberOfLines={1} style={{ flex: 1 }}>{title}</AppText> : <View style={{ flex: 1 }} />}
      {right ? <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>{right}</View> : null}
    </View>
  );
}

export function HeaderIconButton({
  icon, onPress, accessibilityLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={{
        width: 36, height: 36, borderRadius: radius.full,
        backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={18} color={colors.textPrimary} />
    </Pressable>
  );
}
