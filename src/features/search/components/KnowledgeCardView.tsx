import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { ListRow } from '@/components/ui/ListRow';
import { useTopics } from '@/hooks/queries';
import { openUrl } from '@/utils/link';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import type { KnowledgeCard as KnowledgeCardData } from '@/types';

function BlockLabel({ children }: { children: string }) {
  return (
    <AppText variant="caption" color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
      {children}
    </AppText>
  );
}

export function KnowledgeCardView({
  card, onSearch,
}: {
  card: KnowledgeCardData;
  onSearch: (query: string) => void;
}) {
  const { colors, spacing, radius } = useTheme();
  const { data: topics } = useTopics();
  const [expanded, setExpanded] = useState(false);

  const relatedTopics = (topics ?? []).filter((topic) => card.relatedTopicIds.includes(topic.id));

  return (
    <Card style={{ marginBottom: spacing.md }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="caption" color="accent" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Knowledge
        </AppText>
        <Ionicons name="book-outline" size={14} color={colors.textTertiary} />
      </View>
      <AppText variant="title" style={{ marginTop: spacing.xs }}>{card.term}</AppText>

      {/* 1. Definition */}
      <AppText variant="body" style={{ fontWeight: '600', marginTop: spacing.sm }}>
        {card.definition}
      </AppText>

      {/* 2. Simple explanation */}
      <AppText variant="small" color="secondary" style={{ marginTop: spacing.sm }}>
        {card.simpleExplanation}
      </AppText>

      {/* 3. Detailed explanation (expandable) */}
      <Pressable
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Collapse detailed explanation' : 'Expand detailed explanation'}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md }}
      >
        <AppText variant="heading">In depth</AppText>
        <Ionicons name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={16} color={colors.textTertiary} />
      </Pressable>
      <AppText variant="small" color="secondary" numberOfLines={expanded ? undefined : 4} style={{ marginTop: spacing.xs }}>
        {card.detailedExplanation}
      </AppText>

      {/* 4. Example */}
      <View style={{ backgroundColor: colors.accentSoft, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md }}>
        <BlockLabel>Example</BlockLabel>
        <AppText variant="small" style={{ marginTop: spacing.xs }}>{card.example}</AppText>
      </View>

      {/* 5. Real-world use */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, alignItems: 'flex-start' }}>
        <Ionicons name="briefcase-outline" size={14} color={colors.accent} style={{ marginTop: 3 }} />
        <AppText variant="small" color="secondary" style={{ flex: 1 }}>{card.realWorldUse}</AppText>
      </View>

      {/* 6. Related topics */}
      {relatedTopics.length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          <BlockLabel>Related topics</BlockLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }}>
            {relatedTopics.map((topic) => (
              <Chip key={topic.id} label={topic.name} icon="pricetags-outline" onPress={() => router.push(routes.topic(topic.id))} />
            ))}
          </View>
        </View>
      )}

      {/* 7. Latest updates */}
      {card.latestUpdates.length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          <BlockLabel>Latest updates</BlockLabel>
          {card.latestUpdates.map((update) => (
            <ListRow
              key={update.id}
              icon="newspaper-outline"
              title={update.title}
              subtitle={update.subtitle}
              onPress={() => router.push(update.route)}
            />
          ))}
        </View>
      )}

      {/* 8. Sources */}
      {card.sources.length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          <BlockLabel>Sources</BlockLabel>
          {card.sources.map((source) => (
            <ListRow
              key={source.url}
              icon="open-outline"
              title={source.title}
              onPress={() => openUrl(source.url)}
            />
          ))}
        </View>
      )}

      {/* Related searches */}
      {card.relatedSearches.length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          <BlockLabel>People also search</BlockLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }}>
            {card.relatedSearches.map((text) => (
              <Chip key={text} label={text} onPress={() => onSearch(text)} />
            ))}
          </View>
        </View>
      )}
    </Card>
  );
}
