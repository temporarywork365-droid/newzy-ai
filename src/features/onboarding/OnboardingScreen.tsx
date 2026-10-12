import { useRef, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { iconSize } from '@/theme/tokens';

const SLIDES = [
  {
    icon: 'newspaper-outline',
    title: 'Know what matters',
    description: 'A daily brief of everything happening in AI — product launches, research, funding and policy, curated so you never miss the signal.',
  },
  {
    icon: 'compass-outline',
    title: 'Go deeper, on demand',
    description: 'Model benchmarks, tool ratings, paper explainers and topic pages. From your first "what is an LLM?" to frontier model comparisons.',
  },
  {
    icon: 'flash-outline',
    title: 'Put AI to work',
    description: 'Copy-ready prompt templates, step-by-step workflows and agent profiles — everything you need to actually ship with AI.',
  },
] as const;

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { colors, spacing, radius } = useTheme();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const isLast = index === SLIDES.length - 1;

  const goToSlide = (next: number) => {
    const clamped = Math.max(0, Math.min(SLIDES.length - 1, next));
    setIndex(clamped);
    scrollViewRef.current?.scrollTo({ x: clamped * width, animated: true });
  };

  return (
    <Screen>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
          <Pressable onPress={onComplete} hitSlop={8} accessibilityRole="button">
            <AppText variant="caption" color="tertiary">Skip</AppText>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
          }}
          style={{ flex: 1 }}
        >
          {SLIDES.map((slide) => (
            <View key={slide.title} style={{ width, paddingHorizontal: spacing.xl, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{
                width: 96, height: 96, borderRadius: radius.xl,
                backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center',
                marginBottom: spacing.xl,
              }}>
                <Ionicons name={slide.icon} size={iconSize.xl} color={colors.accent} />
              </View>
              <AppText variant="display" style={{ textAlign: 'center' }}>{slide.title}</AppText>
              <AppText variant="body" color="secondary" style={{ textAlign: 'center', marginTop: spacing.md }}>
                {slide.description}
              </AppText>
            </View>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.sm }}>
            {SLIDES.map((slide, dotIndex) => (
              <View
                key={slide.title}
                style={{
                  width: dotIndex === index ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: dotIndex === index ? colors.accent : colors.border,
                }}
              />
            ))}
          </View>
          <Button
            label={isLast ? 'Get started' : 'Continue'}
            onPress={() => (isLast ? onComplete() : goToSlide(index + 1))}
          />
        </View>
      </View>
    </Screen>
  );
}
