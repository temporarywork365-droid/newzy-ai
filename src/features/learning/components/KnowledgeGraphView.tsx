import { Fragment } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chip } from '@/components/ui/Chip';
import { useTheme } from '@/theme/ThemeProvider';

export interface GraphTopic { id: string; title: string; }

/**
 * Renders related topics as a tappable chain:
 * RAG → Embeddings → Vector Databases → Context Window → LLM
 */
export function KnowledgeGraphView({
  topics, onTopicPress,
}: {
  topics: GraphTopic[];
  onTopicPress: (topicId: string) => void;
}) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs }}>
      {topics.map((topic, index) => (
        <Fragment key={topic.id}>
          {index > 0 ? <Ionicons name="arrow-forward" size={12} color={colors.textTertiary} /> : null}
          <Chip label={topic.title} onPress={() => onTopicPress(topic.id)} />
        </Fragment>
      ))}
    </View>
  );
}
