import { useLocalSearchParams } from 'expo-router';
import { ArticleDetailScreen } from '@/features/news/ArticleDetailScreen';

export default function ArticleRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ArticleDetailScreen id={id} />;
}
