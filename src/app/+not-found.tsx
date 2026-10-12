import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/Button';

export default function NotFoundRoute() {
  return (
    <Screen style={{ paddingHorizontal: 16 }}>
      <ScreenHeader title="Lost in space" subtitle="This screen doesn't exist." />
      <Button label="Go home" onPress={() => router.push('/')} />
    </Screen>
  );
}
