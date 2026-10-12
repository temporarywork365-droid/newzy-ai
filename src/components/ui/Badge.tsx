import { View } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { toneSoftKey, toneStrongKey } from '@/theme/colors';
import type { Tone } from '@/theme/tokens';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.full,
        backgroundColor: colors[toneSoftKey[tone]],
      }}
    >
      <AppText variant="caption" style={{ color: colors[toneStrongKey[tone]], textTransform: 'uppercase' }}>
        {label}
      </AppText>
    </View>
  );
}
