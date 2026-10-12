import { useLocalSearchParams } from 'expo-router';
import { CompanyDetailScreen } from '@/features/companies/CompanyDetailScreen';

export default function CompanyRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CompanyDetailScreen id={id} />;
}
