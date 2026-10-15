import type { Article, DailyDigest } from '@/types';

/**
 * Fetches the data the GitHub Actions pipeline (scripts/generate-news.mjs) writes to
 * data/live/*.json and commits to the repo. Replace <GITHUB_USER> below with your GitHub
 * username once this repo is pushed to GitHub, and make sure the repo is public (raw.
 * githubusercontent.com cannot serve files from a private repo without an auth token).
 *
 * If the fetch fails for any reason (offline, repo not set up yet, placeholder still in
 * place), every function here returns null and the app falls back to the static mock data
 * in ./data — nothing breaks.
 */
const GITHUB_USER = 'temporarywork365-droid';
const GITHUB_REPO = 'newzy-ai';
const GITHUB_BRANCH = 'main';

const BASE = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/data/live`;
const TIMEOUT_MS = 6000;

async function fetchJson<T>(url: string): Promise<T | null> {
  if (GITHUB_USER.startsWith('<')) return null; // placeholder not yet filled in

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // Cache-bust so the app always sees the latest commit, not a stale CDN copy.
    const response = await fetch(`${url}?t=${Date.now()}`, { signal: controller.signal });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// Cached for the lifetime of the app session — one fetch per cold start, not one per screen.
let articlesPromise: Promise<Article[] | null> | null = null;
let digestPromise: Promise<DailyDigest | null> | null = null;

export function getLiveArticles(): Promise<Article[] | null> {
  if (!articlesPromise) articlesPromise = fetchJson<Article[]>(`${BASE}/articles.json`);
  return articlesPromise;
}

export function getLiveDigest(): Promise<DailyDigest | null> {
  if (!digestPromise) digestPromise = fetchJson<DailyDigest>(`${BASE}/digest.json`);
  return digestPromise;
}

/** Call this (e.g. on pull-to-refresh) to force the next read to hit the network again. */
export function clearLiveDataCache(): void {
  articlesPromise = null;
  digestPromise = null;
}
