import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { FilterRow } from '@/components/ui/FilterRow';
import { ListRow } from '@/components/ui/ListRow';
import { EmptyView, SkeletonRows } from '@/components/ui/StateViews';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { Section } from '@/components/layout/Section';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { ENTITY_ICONS, ENTITY_TYPE_LABELS, POPULAR_SEARCHES } from '@/constants/taxonomy';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchResults, useSearchSuggestions, useTopics } from '@/hooks/queries';
import { usePreferencesStore } from '@/store/preferencesStore';
import { routes } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import type { EntityType } from '@/types';
import { buildFilterOptions, filterResults, findRelatedTopics, groupResultsByType } from './searchLogic';
import { KnowledgeCardView } from './components/KnowledgeCardView';

export function SearchScreen() {
  const { spacing } = useTheme();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | EntityType>('all');

  // Suggestions react fast (120ms); results settle after a pause (350ms).
  const suggestionQuery = useDebounce(query, 120);
  const debouncedQuery = useDebounce(query, 350);
  const trimmed = debouncedQuery.trim();

  const recent = usePreferencesStore((s) => s.recentSearches);
  const addRecentSearch = usePreferencesStore((s) => s.addRecentSearch);
  const clearRecentSearches = usePreferencesStore((s) => s.clearRecentSearches);

  const { data, isLoading } = useSearchResults(trimmed);
  const { data: suggestions } = useSearchSuggestions(suggestionQuery.trim());
  const { data: topicsData } = useTopics();

  const allResults = data?.results ?? [];

  // Zones: idle (no input) → suggestions (typing / short input) → results (settled query).
  const trimmedInput = query.trim();
  const showResults = trimmed.length > 1 && trimmedInput === trimmed;
  const showSuggestions = !showResults && trimmedInput.length > 0;

  const visible = filterResults(allResults, category);
  const groups = groupResultsByType(visible);
  const filterOptions = buildFilterOptions(allResults);
  const relatedTopics = findRelatedTopics(trimmed, topicsData);

  const selectQuery = (text: string) => {
    setQuery(text);
    addRecentSearch(text);
  };

  const submitSearch = () => {
    const q = query.trim();
    if (q.length > 0) addRecentSearch(q);
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingHorizontal: spacing.lg }}>
          <ScreenHeader title="Search" subtitle="Ask anything about AI — concepts, models, tools, news." />
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={submitSearch}
            placeholder="Try “What is RAG?”, “Claude”, “AI coding tools”…"
            autoFocus
          />
          <View style={{ marginTop: spacing.md }}>
            <OfflineBanner />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Zone 1 — idle */}
          {trimmedInput.length === 0 && (
            <>
              {recent.length > 0 && (
                <Section title="Recent searches" actionLabel="Clear" onAction={clearRecentSearches}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                    {recent.map((q) => (
                      <Chip key={q} label={q} onPress={() => setQuery(q)} />
                    ))}
                  </View>
                </Section>
              )}
              <Section title="Trending searches">
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {POPULAR_SEARCHES.map((topic) => (
                    <Chip key={topic} label={topic} onPress={() => selectQuery(topic)} />
                  ))}
                </View>
              </Section>
              <Section title="Browse topics">
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {topicsData?.map((topic) => (
                    <Chip key={topic.id} label={topic.name} icon="pricetags-outline" onPress={() => router.push(routes.topic(topic.id))} />
                  ))}
                </View>
              </Section>
            </>
          )}

          {/* Zone 2 — typing: live suggestions from the search service */}
          {showSuggestions && (
            <Section title="Suggestions">
              {suggestions && suggestions.length > 0 ? (
                suggestions.map((suggestion) => (
                  <ListRow
                    key={`${suggestion.hint}:${suggestion.text}`}
                    icon={suggestion.hint === 'Trending' ? ENTITY_ICONS.article : 'search-outline'}
                    title={suggestion.text}
                    meta={suggestion.hint}
                    onPress={() => selectQuery(suggestion.text)}
                  />
                ))
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {POPULAR_SEARCHES.slice(0, 4).map((topic) => (
                    <Chip key={topic} label={topic} onPress={() => selectQuery(topic)} />
                  ))}
                </View>
              )}
            </Section>
          )}

          {/* Zone 3 — results */}
          {showResults && (
            isLoading ? (
              <SkeletonRows count={4} />
            ) : (
              <>
                {/* Knowledge card for conceptual queries */}
                {data?.knowledge && <KnowledgeCardView card={data.knowledge} onSearch={selectQuery} />}

                {/* Related topics (only when no knowledge card already shows them) */}
                {!data?.knowledge && relatedTopics.length > 0 && (
                  <Section title="Related topics">
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                      {relatedTopics.map((topic) => (
                        <Chip key={topic.id} label={topic.name} icon="pricetags-outline" onPress={() => router.push(routes.topic(topic.id))} />
                      ))}
                    </View>
                  </Section>
                )}

                {/* Category filters */}
                {allResults.length > 1 && (
                  <FilterRow options={filterOptions} value={category} onChange={setCategory} />
                )}

                {/* Grouped results */}
                {groups.length === 0 && !data?.knowledge ? (
                  <EmptyView
                    icon="search-outline"
                    title="No results"
                    message={`Nothing matched “${trimmed}”. Try a broader term.`}
                  />
                ) : (
                  groups.map(([type, results]) => (
                    <Section key={type} title={ENTITY_TYPE_LABELS[type]}>
                      {results.map((result) => (
                        <ListRow
                          key={`${result.type}:${result.id}`}
                          icon={ENTITY_ICONS[result.type]}
                          title={result.title}
                          subtitle={result.subtitle}
                          onPress={() => router.push(result.route)}
                        />
                      ))}
                    </Section>
                  ))
                )}

                {/* Related searches from the engine */}
                {data?.relatedQueries && data.relatedQueries.length > 0 && (
                  <Section title="Related searches">
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                      {data.relatedQueries.map((text) => (
                        <Chip key={text} label={text} onPress={() => selectQuery(text)} />
                      ))}
                    </View>
                  </Section>
                )}
              </>
            )
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
