import { useLocalSearchParams } from 'expo-router';
import { ToolDetailScreen } from '@/features/tools/ToolDetailScreen';

export default function ToolRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ToolDetailScreen id={id} />;
}
