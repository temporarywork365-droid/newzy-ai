import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getErrorMessage } from '@/api/errors';
import { AppText } from './AppText';
import { Button } from './Button';
import { useTheme } from '@/theme/ThemeProvider';

export function LoadingView({ label = 'Loading' }: { label?: string }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ padding: spacing.xxl, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
      <ActivityIndicator color={colors.accent} />
      <AppText variant="small" color="tertiary">{label}…</AppText>
    </View>
  );
}

export function ErrorView({ error, onRetry, message }: { error?: unknown; onRetry?: () => void; message?: string }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ padding: spacing.xxl, alignItems: 'center', gap: spacing.md }}>
      <Ionicons name="cloud-offline-outline" size={32} color={colors.textTertiary} />
      <AppText variant="heading">Something went wrong</AppText>
      <AppText variant="small" color="secondary" style={{ textAlign: 'center' }}>
        {message ?? getErrorMessage(error)}
      </AppText>
      {onRetry ? <Button label="Try again" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyView({
  icon = 'sparkles-outline', title, message, actionLabel, onAction,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ padding: spacing.xxl, alignItems: 'center', gap: spacing.md }}>
      <Ionicons name={icon} size={32} color={colors.textTertiary} />
      <AppText variant="heading" style={{ textAlign: 'center' }}>{title}</AppText>
      {message ? <AppText variant="small" color="secondary" style={{ textAlign: 'center' }}>{message}</AppText> : null}
      {actionLabel && onAction ? <Button label={actionLabel} variant="secondary" onPress={onAction} /> : null}
    </View>
  );
}

export function SkeletonRows({ count = 4 }: { count?: number }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View style={{ paddingVertical: spacing.md, gap: spacing.md }}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm }}>
          <View style={{ height: 14, width: '60%', borderRadius: radius.sm, backgroundColor: colors.border }} />
          <View style={{ height: 12, width: '90%', borderRadius: radius.sm, backgroundColor: colors.border }} />
          <View style={{ height: 12, width: '40%', borderRadius: radius.sm, backgroundColor: colors.border }} />
        </View>
      ))}
    </View>
  );
}
