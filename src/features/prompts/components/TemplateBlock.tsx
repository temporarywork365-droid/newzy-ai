import { Platform, Text, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' });

/** Renders a prompt template with {{variables}} highlighted in the accent color. */
export function TemplateBlock({ template }: { template: string }) {
  const { colors, radius, spacing } = useTheme();
  const parts = template.split(/(\{\{[^}]+\}\})/g);

  return (
    <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md }}>
      <AppText variant="small" style={{ fontFamily: MONO }}>
        {parts.map((part, index) =>
          part.startsWith('{{') ? (
            <Text key={index} style={{ color: colors.accent, fontWeight: '700' }}>{part}</Text>
          ) : (
            <Text key={index}>{part}</Text>
          ),
        )}
      </AppText>
    </View>
  );
}
