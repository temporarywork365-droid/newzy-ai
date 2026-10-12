import { useLocalSearchParams } from 'expo-router';
import { PromptDetailScreen } from '@/features/prompts/PromptDetailScreen';

export default function PromptRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PromptDetailScreen id={id} />;
}
