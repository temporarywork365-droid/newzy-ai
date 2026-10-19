import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { refreshLiveData } from '@/api/mock/mockApi';
import { isLiveQueryKey, startLiveRefresh } from '@/utils/liveRefresh';

/** Invisible. While the app is open it keeps the news up to date, so a big story shows up without a manual refresh. */
export function LiveNewsRefresher() {
  const queryClient = useQueryClient();
  useEffect(
    () =>
      startLiveRefresh({
        refresh: async () => {
          const changed = await refreshLiveData();
          if (changed) queryClient.invalidateQueries({ predicate: (query) => isLiveQueryKey(query.queryKey) });
        },
        appState: {
          current: () => AppState.currentState ?? 'active',
          subscribe: (callback) => {
            const subscription = AppState.addEventListener('change', callback);
            return () => subscription.remove();
          },
        },
      }),
    [queryClient],
  );
  return null;
}
