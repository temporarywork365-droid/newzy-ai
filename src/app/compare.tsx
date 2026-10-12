import { useLocalSearchParams } from 'expo-router';
import { CompareScreen } from '@/features/compare/CompareScreen';

export default function CompareRoute() {
  const { left } = useLocalSearchParams<{ left?: string }>();
  return <CompareScreen initialLeftId={left} />;
}
