/**
 * Keeps the news fresh while the app is open: checks the server every few minutes, and again whenever
 * the person comes back to the app. Plain functions (no React) so the timing can be tested on its own.
 */

export const LIVE_REFRESH_INTERVAL_MS = 3 * 60_000; // while the app is open
export const LIVE_REFRESH_MIN_GAP_MS = 60_000; // coming back to the app within a minute does not refresh again

export interface AppStateSource {
  current: () => string;
  /** Calls back with 'active', 'background' or 'inactive'. Returns a function that stops listening. */
  subscribe: (callback: (state: string) => void) => () => void;
}

export interface LiveRefreshOptions {
  refresh: () => Promise<void>;
  appState: AppStateSource;
  intervalMs?: number;
  minGapMs?: number;
  now?: () => number;
}

/** Starts the refresh loop. Returns a function that stops it. */
export function startLiveRefresh({
  refresh,
  appState,
  intervalMs = LIVE_REFRESH_INTERVAL_MS,
  minGapMs = LIVE_REFRESH_MIN_GAP_MS,
  now = Date.now,
}: LiveRefreshOptions): () => void {
  let timer: ReturnType<typeof setInterval> | null = null;
  let running = false;
  let lastRun = now(); // the first load has just happened

  const tick = async () => {
    if (running) return; // never two at once
    running = true;
    try {
      await refresh();
    } catch {
      /* a failed check is fine: the old news stays on screen */
    } finally {
      running = false;
      lastRun = now();
    }
  };

  const start = () => {
    if (!timer) timer = setInterval(tick, intervalMs);
  };
  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  if (appState.current() === 'active') start();
  const unsubscribe = appState.subscribe((state) => {
    if (state === 'active') {
      start();
      if (now() - lastRun >= minGapMs) void tick();
    } else {
      stop(); // no checking while the app is in the background
    }
  });

  return () => {
    stop();
    unsubscribe();
  };
}

/** Which cached screens must reload when new stories arrive. */
const LIVE_QUERY_ROOTS = new Set(['news', 'search', 'digest']);
export const isLiveQueryKey = (key: readonly unknown[]): boolean => LIVE_QUERY_ROOTS.has(String(key[0]));
