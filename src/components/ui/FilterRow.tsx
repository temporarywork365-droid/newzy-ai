import { ScrollView } from 'react-native';
import { Chip } from './Chip';
import { prettifyKey } from '@/utils/labels';
import { useTheme } from '@/theme/ThemeProvider';

export interface FilterOption<V extends string> { value: V; label: string; }

export function FilterRow<V extends string>({
  options, value, onChange,
}: {
  options: readonly FilterOption<V>[];
  value: V;
  onChange: (next: V) => void;
}) {
  const { spacing } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.lg, paddingVertical: spacing.sm }}
    >
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          active={option.value === value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </ScrollView>
  );
}

/**
 * Builds filter options from the values actually present in API data.
 * New backend categories/entries appear automatically — labels fall back to a
 * prettified key when no label constant exists yet.
 */
export function buildFilterOptions<T extends string>(
  values: T[] | undefined,
  labels: Record<string, string>,
): FilterOption<'all' | T>[] {
  const present = [...new Set(values ?? [])];
  return [
    { value: 'all' as const, label: 'All' },
    ...present.map((value) => ({ value, label: labels[value] ?? prettifyKey(value) })),
  ];
}
