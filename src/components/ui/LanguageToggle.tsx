import { View } from 'react-native';
import { Chip } from './Chip';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useTheme } from '@/theme/ThemeProvider';

/** English / हिंदी switch for news summaries. The choice is remembered on the phone. */
export function LanguageToggle() {
  const { spacing } = useTheme();
  const language = usePreferencesStore((s) => s.language);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  return (
    <View style={{ flexDirection: 'row', gap: spacing.xs }}>
      <Chip label="English" small active={language === 'en'} onPress={() => setLanguage('en')} />
      <Chip label="हिंदी" small active={language === 'hi'} onPress={() => setLanguage('hi')} />
    </View>
  );
}
