import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSavedStore } from '@/store/savedStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { EntityType } from '@/types';

interface SaveButtonProps {
  id: string;
  type: EntityType;
  compact?: boolean;
}

export function SaveButton({ id, type, compact = false }: SaveButtonProps) {
  const { colors, radius } = useTheme();
  const isSaved = useSavedStore((s) => s.items.some((item) => item.id === id));
  const toggle = useSavedStore((s) => s.toggle);
  const size = compact ? 30 : 36;

  return (
    <Pressable
      onPress={() => toggle(id, type)}
      hitSlop={8}
      accessibilityLabel={isSaved ? 'Remove from saved' : 'Save'}
      accessibilityRole="button"
      style={{
        width: size, height: size, borderRadius: radius.full,
        backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={compact ? 15 : 18} color={colors.accent} />
    </Pressable>
  );
}
