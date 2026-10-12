import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { FilterRow, type FilterOption } from '@/components/ui/FilterRow';
import { KeyValueGrid } from '@/components/ui/KeyValueGrid';
import { Section } from '@/components/layout/Section';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { APP_CONFIG } from '@/constants/config';
import { INTEREST_LABELS } from '@/constants/interests';
import { useAuthStore } from '@/store/authStore';
import { useInterestsStore } from '@/store/interestsStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useSavedStore } from '@/store/savedStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { ThemeMode } from '@/theme/tokens';

const THEME_OPTIONS: FilterOption<ThemeMode>[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function SettingsScreen() {
  const { spacing } = useTheme();

  const themeMode = usePreferencesStore((s) => s.themeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);
  const recentSearches = usePreferencesStore((s) => s.recentSearches);
  const clearRecentSearches = usePreferencesStore((s) => s.clearRecentSearches);
  const resetOnboarding = usePreferencesStore((s) => s.resetOnboarding);

  const interests = useInterestsStore((s) => s.interests);

  const authStatus = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const savedCount = useSavedStore((s) => s.items.length);
  const clearSaved = useSavedStore((s) => s.clear);

  const confirmClearSaved = () => {
    Alert.alert('Clear saved items?', 'This removes all bookmarks from this device. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearSaved() },
    ]);
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out?', 'Your session token will be removed from this device. Local data stays.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => { signOut(); } },
    ]);
  };

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <DetailHeader title="Settings" />

      {/* Account */}
      {authStatus !== 'hydrating' && (
        <Section title="Account" style={{ marginTop: spacing.sm }}>
          {authStatus === 'authenticated' && user ? (
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <AppText variant="heading" numberOfLines={1}>{user.name}</AppText>
                  <AppText variant="small" color="secondary" style={{ marginTop: 2 }}>{user.email}</AppText>
                </View>
                <Badge label={user.plan} tone="accent" />
              </View>
              <Button label="Sign out" variant="ghost" icon="log-out-outline" onPress={confirmSignOut} style={{ marginTop: spacing.md }} />
            </Card>
          ) : (
            <View>
              <Button label="Sign in" variant="secondary" icon="person-outline" onPress={() => router.push('/auth')} />
              <AppText variant="small" color="secondary" style={{ marginTop: spacing.sm }}>
                Sync interests and preferences across devices. Optional — everything works locally without an account.
              </AppText>
            </View>
          )}
        </Section>
      )}

      <Section title="Personalization">
        <Button
          label={interests.length > 0 ? `Choose interests (${interests.length})` : 'Choose interests'}
          variant="secondary"
          icon="person-outline"
          onPress={() => router.push('/interests')}
        />
        {interests.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
            {interests.map((key) => (
              <Chip key={key} label={INTEREST_LABELS[key]} tone="accent" />
            ))}
          </View>
        ) : (
          <AppText variant="small" color="secondary" style={{ marginTop: spacing.sm }}>
            No interests selected — your Home feed stays general.
          </AppText>
        )}
      </Section>

      <Section title="Appearance">
        <FilterRow options={THEME_OPTIONS} value={themeMode} onChange={setThemeMode} />
        <AppText variant="small" color="secondary" style={{ marginTop: spacing.sm }}>
          Choose how Newzy AI looks. "System" follows your phone's setting.
        </AppText>
      </Section>

      <Section title="Your data">
        <Button label={`Clear saved items (${savedCount})`} variant="secondary" icon="bookmark-outline" onPress={confirmClearSaved} />
        <Button label={`Clear recent searches (${recentSearches.length})`} variant="secondary" icon="time-outline" onPress={() => clearRecentSearches()} style={{ marginTop: spacing.md }} />
        <Button label="Replay onboarding" variant="ghost" icon="refresh-outline" onPress={resetOnboarding} style={{ marginTop: spacing.md }} />
      </Section>

      <Section title="About">
        <KeyValueGrid items={[
          { label: 'Version', value: '1.0.0' },
          { label: 'Data source', value: APP_CONFIG.apiBaseUrl ? 'Live API' : 'Demo data' },
          { label: 'Platform', value: 'Expo · React Native' },
          { label: 'Content', value: '12 content types' },
        ]} />
        <AppText variant="small" color="tertiary" style={{ marginTop: spacing.md, textAlign: 'center' }}>
          Newzy AI — search, understand, explore, learn, use.
        </AppText>
      </Section>
    </Screen>
  );
}
