import { useLocalSearchParams } from 'expo-router';
import { WorkflowDetailScreen } from '@/features/workflows/WorkflowDetailScreen';

export default function WorkflowRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <WorkflowDetailScreen id={id} />;
}
