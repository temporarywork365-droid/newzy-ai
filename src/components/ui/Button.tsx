import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { interaction } from '@/theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', icon, disabled = false, style }: ButtonProps) {
  const { colors, spacing, radius } = useTheme();
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const contentColor = isPrimary ? colors.onAccent : colors.accent;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          minHeight: 52,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: spacing.sm,
          paddingHorizontal: spacing.xl,
          opacity: disabled ? interaction.disabledOpacity : pressed ? interaction.pressedOpacity : 1,
          backgroundColor: isPrimary ? colors.accent : isGhost ? 'transparent' : colors.surface,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={contentColor} /> : null}
      <AppText variant="body" style={{ color: contentColor, fontWeight: '600' }}>{label}</AppText>
    </Pressable>
  );
}
