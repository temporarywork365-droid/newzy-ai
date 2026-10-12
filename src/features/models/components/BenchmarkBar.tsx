import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import type { BenchmarkScore } from '@/types';

export function BenchmarkBar({ benchmark }: { benchmark: BenchmarkScore }) {
  const { colors, radius } = useTheme();
  const pct = Math.min(100, (benchmark.score / benchmark.max) * 100);
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <AppText variant="small">{benchmark.benchmark}</AppText>
        <AppText variant="small" color="secondary">
          {benchmark.score.toFixed(1)}{benchmark.note ? ` · ${benchmark.note}` : ''}
        </AppText>
      </View>
      <View style={{ height: 6, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: 6, borderRadius: radius.full, backgroundColor: colors.accent }} />
      </View>
    </View>
  );
}
