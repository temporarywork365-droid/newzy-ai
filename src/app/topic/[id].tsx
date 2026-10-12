import { useLocalSearchParams } from 'expo-router';
import { TopicScreen } from '@/features/topics/TopicScreen';

export default function TopicRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TopicScreen id={id} />;
}
