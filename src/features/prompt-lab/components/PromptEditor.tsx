import { Pressable, TextInput, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

interface PromptEditorProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

/** Mobile-friendly prompt editor: auto-growing, char count, quick clear. */
export function PromptEditor({ value, onChangeText, placeholder = 'e.g. Create a YouTube script about AI' }: PromptEditorProps) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View style={{
      backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
      borderRadius: radius.lg, padding: spacing.md,
    }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline
        textAlignVertical="top"
        autoCapitalize="sentences"
        autoCorrect
        style={{
          minHeight: 120, maxHeight: 240,
          color: colors.textPrimary, fontSize: 15, lineHeight: 22, padding: 0,
        }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm }}>
        <AppText variant="caption" color="tertiary">{value.trim().length} characters</AppText>
        {value.length > 0 ? (
          <Pressable onPress={() => onChangeText('')} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear prompt">
            <AppText variant="caption" color="accent">Clear</AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
