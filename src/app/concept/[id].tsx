import { useLocalSearchParams } from 'expo-router';
import { ConceptDetailScreen } from '@/features/learning/ConceptDetailScreen';

export default function ConceptRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ConceptDetailScreen id={id} />;
}
