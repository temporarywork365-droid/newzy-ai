import { useLocalSearchParams } from 'expo-router';
import { ResearchDetailScreen } from '@/features/research/ResearchDetailScreen';

export default function ResearchRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ResearchDetailScreen id={id} />;
}
