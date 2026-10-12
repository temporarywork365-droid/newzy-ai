import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { toneSoftKey, toneStrongKey } from '@/theme/colors';
import type { Tone } from '@/theme/tokens';

interface ChipProps {
  label: string;
  active?: boolean;
  tone?: Tone;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, active = false, tone = 'neutral', icon, onPress, small = false, style }: ChipProps) {
  const { colors, radius, spacing } = useTheme();
  const backgroundColor = active ? colors.accent : colors[toneSoftKey[tone]];
  const textColor = active ? colors.onAccent : colors[toneStrongKey[tone]];

  const body = (
    <View
      style={[
        {
          flexDirection: 'row', alignItems: 'center', gap: 4,
          paddingHorizontal: small ? spacing.sm : spacing.md,
          paddingVertical: small ? 3 : 5,
          borderRadius: radius.full,
          backgroundColor,
        },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={small ? 11 : 13} color={textColor} /> : null}
      <AppText variant="caption" style={{ color: textColor, fontSize: small ? 10 : 11 }}>{label}</AppText>
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} hitSlop={6} accessibilityRole="button">
      {body}
    </Pressable>
  );
}
