import { useLocalSearchParams } from 'expo-router';
import { AgentLessonScreen } from '@/features/agents/AgentLessonScreen';

export default function LessonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AgentLessonScreen id={id} />;
}
