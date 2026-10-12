import { View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { useTheme } from '@/theme/ThemeProvider';

export function OfflineBanner() {
  const { isConnected } = useNetInfo();
  const { colors, spacing, radius } = useTheme();

  if (isConnected !== false) return null;

  return (
    <View
      accessibilityRole="alert"
      style={{
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        backgroundColor: colors.dangerSoft, borderRadius: radius.md,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
      }}
    >
      <Ionicons name="cloud-offline-outline" size={14} color={colors.danger} />
      <AppText variant="caption" style={{ color: colors.danger, flex: 1 }}>
        You're offline — showing saved content
      </AppText>
    </View>
  );
}
