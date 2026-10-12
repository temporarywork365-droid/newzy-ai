import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { useTheme } from '@/theme/ThemeProvider';

/** Shared "open search" entry row (used on Home + News). */
export function SearchEntry({ placeholder = 'Search news, models, tools, topics…' }: { placeholder?: string }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <Pressable
      onPress={() => router.push('/search')}
      accessibilityRole="button"
      accessibilityLabel="Open search"
      style={({ pressed }) => [{
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
        borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 48,
        opacity: pressed ? 0.85 : 1,
      }]}
    >
      <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
      <AppText variant="body" color="tertiary">{placeholder}</AppText>
    </Pressable>
  );
}
