import { Platform, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { Bullets } from '@/components/ui/Bullets';
import { toneSoftKey, toneStrongKey } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';
import type { ContentBlock } from '@/types';

const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' });

export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={{ gap: spacing.lg }}>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case 'heading':
            return <AppText key={index} variant="heading" style={{ marginTop: spacing.xs }}>{block.text}</AppText>;

          case 'paragraph':
            return <AppText key={index} variant="body">{block.text}</AppText>;

          case 'bullets':
            return <Bullets key={index} items={block.items} />;

          case 'quote':
            return (
              <View key={index} style={{ borderLeftWidth: 3, borderLeftColor: colors.accent, paddingLeft: spacing.md }}>
                <AppText variant="body" color="secondary" style={{ fontStyle: 'italic' }}>“{block.text}”</AppText>
                {block.attribution ? (
                  <AppText variant="caption" color="tertiary" style={{ marginTop: spacing.xs }}>— {block.attribution}</AppText>
                ) : null}
              </View>
            );

          case 'code':
            return (
              <View key={index} style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md }}>
                <AppText variant="small" style={{ fontFamily: MONO }}>{block.code}</AppText>
              </View>
            );

          case 'callout':
            return (
              <View
                key={index}
                style={{
                  backgroundColor: colors[toneSoftKey[block.tone]],
                  borderRadius: radius.md,
                  padding: spacing.md,
                  flexDirection: 'row',
                  gap: spacing.sm,
                }}
              >
                <Ionicons
                  name={block.tone === 'warning' ? 'warning' : block.tone === 'success' ? 'checkmark-circle' : 'information-circle'}
                  size={16}
                  color={colors[toneStrongKey[block.tone]]}
                />
                <AppText variant="small" style={{ color: colors[toneStrongKey[block.tone]], flex: 1 }}>{block.text}</AppText>
              </View>
            );
        }
      })}
    </View>
  );
}
