import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { INTERESTS, type InterestDefinition } from '@/constants/interests';
import { useInterestsStore } from '@/store/interestsStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { InterestKey } from '@/types/personalization';

function InterestToggle({
  definition, selected, onToggle,
}: {
  definition: InterestDefinition;
  selected: boolean;
  onToggle: () => void;
}) {
  const { colors, spacing, radius } = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={`${selected ? 'Remove' : 'Add'} interest: ${definition.label}`}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: spacing.md,
        backgroundColor: selected ? colors.accentSoft : colors.surface,
        borderWidth: 1, borderColor: selected ? colors.accent : colors.border,
        borderRadius: radius.lg, padding: spacing.md,
      }}
    >
      <View style={{
        width: 40, height: 40, borderRadius: radius.md,
        backgroundColor: selected ? colors.surface : colors.surfaceAlt,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Ionicons name={definition.icon} size={18} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="heading">{definition.label}</AppText>
        <AppText variant="small" color="secondary" style={{ marginTop: 2 }}>{definition.description}</AppText>
      </View>
      <Ionicons
        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={20}
        color={selected ? colors.accent : colors.textTertiary}
      />
    </Pressable>
  );
}

export function InterestsScreen() {
  const { spacing } = useTheme();
  const saved = useInterestsStore((s) => s.interests);
  const setInterests = useInterestsStore((s) => s.setInterests);
  const clearInterests = useInterestsStore((s) => s.clearInterests);

  const [selection, setSelection] = useState<Set<InterestKey>>(new Set(saved));

  const toggle = (key: InterestKey) => {
    setSelection((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const save = () => {
    setInterests([...selection]);
    router.back();
  };

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <DetailHeader title="Interests" />

      <AppText variant="display">Your feed, your rules</AppText>
      <AppText variant="body" color="secondary" style={{ marginTop: spacing.sm }}>
        Pick what you care about — Home will surface a "For You" feed built from your interests. Change these anytime.
      </AppText>

      <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
        {INTERESTS.map((definition) => (
          <InterestToggle
            key={definition.key}
            definition={definition}
            selected={selection.has(definition.key)}
            onToggle={() => toggle(definition.key)}
          />
        ))}
      </View>

      <Button
        label={selection.size > 0 ? `Save interests (${selection.size})` : 'Save interests'}
        icon="checkmark-outline"
        onPress={save}
        style={{ marginTop: spacing.xl }}
      />
      {saved.length > 0 ? (
        <Button
          label="Clear all interests"
          variant="ghost"
          icon="trash-outline"
          onPress={() => { clearInterests(); setSelection(new Set()); }}
          style={{ marginTop: spacing.md }}
        />
      ) : null}
    </Screen>
  );
}
