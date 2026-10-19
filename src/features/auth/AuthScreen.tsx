import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { FilterRow, type FilterOption } from '@/components/ui/FilterRow';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { getErrorMessage } from '@/api/errors';
import { authService, preferencesService } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { useInterestsStore } from '@/store/interestsStore';
import { useTheme } from '@/theme/ThemeProvider';

const MODE_OPTIONS: FilterOption<'login' | 'register'>[] = [
  { value: 'login', label: 'Sign in' },
  { value: 'register', label: 'Create account' },
];

function AuthField({
  label, value, onChangeText, placeholder, secure = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secure?: boolean;
}) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="caption" color="tertiary" style={{ textTransform: 'uppercase' }}>{label}</AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        secureTextEntry={secure}
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
          borderRadius: radius.md, paddingHorizontal: spacing.md, height: 48,
          color: colors.textPrimary, fontSize: 16,
        }}
      />
    </View>
  );
}

export function AuthScreen() {
  const { colors, spacing, radius } = useTheme();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const signIn = useAuthStore((s) => s.signIn);

  const submit = async () => {
    setError(null);
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setSubmitting(true);
    try {
      const session = mode === 'login'
        ? await authService.login({ email: email.trim().toLowerCase(), password })
        : await authService.register({ email: email.trim().toLowerCase(), password, name: name.trim() || undefined });

      await signIn(session);

      // Best-effort: merge server-side interests into the local store.
      try {
        const remote = await preferencesService.load();
        if (remote.interests?.length) {
          useInterestsStore.getState().setInterests(remote.interests);
        }
      } catch { /* preferences are optional */ }

      router.back();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <DetailHeader title="Account" />

      <AppText variant="display">{mode === 'login' ? 'Welcome back' : 'Create your account'}</AppText>
      <AppText variant="body" color="secondary" style={{ marginTop: spacing.sm }}>
        Sync your interests and saved library across devices. Credentials are validated by the backend — the app stores only your session token, securely.
      </AppText>

      <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
        <FilterRow options={MODE_OPTIONS} value={mode} onChange={setMode} />
        {mode === 'register' ? (
          <AuthField label="Name" value={name} onChangeText={setName} placeholder="Ada Lovelace" />
        ) : null}
        <AuthField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
        <AuthField label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secure />
      </View>

      {error ? (
        <View style={{ backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md }}>
          <AppText variant="small" style={{ color: colors.danger }}>{error}</AppText>
        </View>
      ) : null}

      <Button
        label={submitting ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : (mode === 'login' ? 'Sign in' : 'Create account')}
        icon="log-in-outline"
        onPress={submit}
        disabled={submitting}
        style={{ marginTop: spacing.xl }}
      />

      <View style={{ backgroundColor: colors.infoSoft, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, flexDirection: 'row', gap: spacing.sm }}>
        <Ionicons name="information-circle" size={16} color={colors.info} />
        <AppText variant="small" style={{ color: colors.info, flex: 1 }}>
          Demo mode: any email + a 6+ character password signs you in. The production backend validates credentials server-side — no keys ever ship inside the app.
        </AppText>
      </View>
    </Screen>
  );
}
