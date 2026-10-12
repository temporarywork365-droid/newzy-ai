import { useLocalSearchParams } from 'expo-router';
import { AgentDetailScreen } from '@/features/agents/AgentDetailScreen';

export default function AgentRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AgentDetailScreen id={id} />;
}
