import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import { EmptyView } from '@/components/ui/StateViews';
import { DetailHeader, HeaderIconButton } from '@/components/layout/DetailHeader';
import { PROMPT_LAB_CATEGORY_LABELS } from '@/constants/promptLab';
import { usePromptHistoryStore } from '@/store/promptHistoryStore';
import { formatRelativeTime } from '@/utils/format';
import { useTheme } from '@/theme/ThemeProvider';

export function PromptHistoryScreen() {
  const { spacing } = useTheme();
  const items = usePromptHistoryStore((s) => s.items);
  const remove = usePromptHistoryStore((s) => s.remove);
  const clear = usePromptHistoryStore((s) => s.clear);

  const confirmClear = () => {
    Alert.alert('Clear prompt history?', 'All saved analyses will be removed from this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clear() },
    ]);
  };

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <DetailHeader
        title="Prompt history"
        right={items.length > 0 ? (
          <HeaderIconButton icon="trash-outline" onPress={confirmClear} accessibilityLabel="Clear history" />
        ) : undefined}
      />

      {items.length === 0 ? (
        <EmptyView
          icon="time-outline"
          title="No prompts yet"
          message="Analyze a prompt in the Lab and tap Save — your analyses will appear here."
        />
      ) : (
        items.map((item) => (
          <Card key={item.id} style={{ marginBottom: spacing.md }}>
            <AppText variant="heading" numberOfLines={2}>{item.input}</AppText>
            <AppText variant="caption" color="tertiary" style={{ marginTop: spacing.xs }}>
              {PROMPT_LAB_CATEGORY_LABELS[item.category]} · {formatRelativeTime(new Date(item.createdAt).toISOString())}
            </AppText>
            <AppText variant="small" color="secondary" numberOfLines={2} style={{ marginTop: spacing.sm }}>
              {item.improvedPrompt.split('\n').slice(0, 2).join(' ')}
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }}>
              <View style={{ flex: 1.4 }}>
                <Button
                  label="Open in Lab"
                  variant="secondary"
                  onPress={() => router.push({ pathname: '/prompt-lab', params: { item: item.id } })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <CopyButton text={item.improvedPrompt} label="Copy" variant="ghost" />
              </View>
              <HeaderIconButton icon="close-outline" onPress={() => remove(item.id)} accessibilityLabel="Remove" />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
