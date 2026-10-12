import { View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/AppText';
import { CopyButton } from '@/components/ui/CopyButton';
import { TemplateBlock } from '@/features/prompts/components/TemplateBlock';
import { useTheme } from '@/theme/ThemeProvider';

interface PromptResultCardProps {
  title: string;
  prompt: string;
  saved: boolean;
  onSave: () => void;
  onUse: () => void;
}

/** Improved/Advanced prompt card — mono template with highlighted {{variables}}, copy + save + iterate. */
export function PromptResultCard({ title, prompt, saved, onSave, onUse }: PromptResultCardProps) {
  const { spacing } = useTheme();
  return (
    <Card style={{ marginTop: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="heading">{title}</AppText>
        <Badge label="{{variables}}" tone="accent" />
      </View>
      <View style={{ marginTop: spacing.md }}>
        <TemplateBlock template={prompt} />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
        <View style={{ flex: 1 }}>
          <CopyButton text={prompt} label="Copy" />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label={saved ? 'Saved' : 'Save'}
            icon={saved ? 'checkmark-outline' : 'bookmark-outline'}
            variant={saved ? 'secondary' : 'primary'}
            onPress={onSave}
          />
        </View>
      </View>
      <Button
        label="Use as input (iterate)"
        variant="ghost"
        icon="repeat-outline"
        onPress={onUse}
        style={{ marginTop: spacing.md }}
      />
    </Card>
  );
}
