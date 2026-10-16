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
      {/* Upper-cased in code (not with textTransform) and kept on one line: on Android the pill was
          measured with lowercase text, so "AI summary" wrapped and only "AI" stayed visible. */}
      <AppText variant="caption" numberOfLines={1} style={{ color: colors[toneStrongKey[tone]], flexShrink: 0 }}>
        {label.toUpperCase().replace(/ /g, '\u00A0')}
      </AppText>
    </View>
  );
}
