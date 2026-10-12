import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { toneSoftKey, toneStrongKey } from '@/theme/colors';
import type { Tone } from '@/theme/tokens';

export function IconTile({ icon, size = 40, tone = 'accent' }: { icon: keyof typeof Ionicons.glyphMap; size?: number; tone?: Tone }) {
  const { colors, radius } = useTheme();
  return (
    <View style={{
      width: size, height: size, borderRadius: radius.md,
      backgroundColor: colors[toneSoftKey[tone]], alignItems: 'center', justifyContent: 'center',
    }}>
      <Ionicons name={icon} size={Math.round(size * 0.5)} color={colors[toneStrongKey[tone]]} />
    </View>
  );
}
