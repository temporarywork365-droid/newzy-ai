import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { iconSize, motion } from '@/theme/tokens';

interface AppSplashProps {
  fading: boolean;
  onAnimationEnd: () => void;
}

export function AppSplash({ fading, onAnimationEnd }: AppSplashProps) {
  const { colors, spacing, radius } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (fading) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: motion.base,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onAnimationEnd();
      });
    }
  }, [fading, opacity, onAnimationEnd]);

  return (
    <Animated.View
      pointerEvents={fading ? 'none' : 'auto'}
      style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', opacity }}
    >
      <View style={{
        width: 84, height: 84, borderRadius: radius.xl,
        backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.lg,
      }}>
        <Ionicons name="sparkles" size={iconSize.xl + 8} color={colors.accent} />
      </View>
      <View style={{ flexDirection: 'row' }}>
        <AppText variant="display">Newzy</AppText>
        <AppText variant="display" color="accent"> AI</AppText>
      </View>
      <AppText variant="small" color="secondary" style={{ marginTop: spacing.xs }}>
        Your daily AI intelligence
      </AppText>
    </Animated.View>
  );
}
