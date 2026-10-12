import { useLocalSearchParams } from 'expo-router';
import { ModelDetailScreen } from '@/features/models/ModelDetailScreen';

export default function ModelRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ModelDetailScreen id={id} />;
}
