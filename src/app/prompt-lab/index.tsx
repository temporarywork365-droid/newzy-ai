import { useLocalSearchParams } from 'expo-router';
import { PromptLabScreen } from '@/features/prompt-lab/PromptLabScreen';

export default function PromptLabRoute() {
  const { item } = useLocalSearchParams<{ item?: string }>();
  return <PromptLabScreen historyItemId={item} />;
}
