#!/usr/bin/env node
/**
 * Newzy AI — daily news pipeline.
 * Calls the Gemini API (with Google Search grounding) to find real AI news from the
 * last ~36 hours, merges it into data/live/articles.json (rolling window, newest first,
 * deduped by title), recomputes a deterministic trendingScore for every stored article,
 * and writes data/live/digest.json from the result. No AI call is used for the digest —
 * it is built in plain JS from the merged article list, to keep this script cheap and
 * predictable.
 *
 * Requires: GEMINI_API_KEY in the environment (set as a GitHub Actions secret in CI).
 * Run locally with:  GEMINI_API_KEY=xxxx node scripts/generate-news.mjs
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set. Aborting.');
  process.exit(1);
}

// Models are tried in this order. If one is overloaded (503) or unavailable (404/429),
// the script moves on to the next one.
const MODELS = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash-lite'];

// Google Search grounding. Without it Gemini cannot look up live news and may invent stories,
// so keep this true for real use. Set to false only to test whether grounding quota is the problem.
const USE_GROUNDING = true;

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODELS[0]}:generateContent?key=${GEMINI_API_KEY}`;

const DATA_DIR = path.resolve('data/live');
const ARTICLES_PATH = path.join(DATA_DIR, 'articles.json');
const DIGEST_PATH = path.join(DATA_DIR, 'digest.json');

const MAX_STORED_ARTICLES = 80; // rolling window
const MAX_ARTICLE_AGE_DAYS = 30; // drop anything older than this

const CATEGORIES = [
  'ai-models', 'ai-tools', 'research', 'companies', 'startups', 'ai-agents', 'robotics',
  'ai-coding', 'ai-video', 'ai-image', 'ai-audio', 'automation', 'regulation', 'industry', 'india-ai',
];

const today = new Date();
const todayLabel = today.toISOString().slice(0, 10);

const PROMPT = `You are a fact-checking AI news editor. Today's date is ${todayLabel}.

Use live web search to find 6 to 10 REAL, SIGNIFICANT AI news items from the LAST 36 HOURS. Only include
events you can verify through a search result you actually found — never invent facts, numbers, or dates.
Prefer official sources (company blogs, regulator sites) and major outlets (Reuters, TechCrunch, Bloomberg,
The Verge) over aggregators. Include at least one India-related item if a real one exists in that window
(IndiaAI Mission, Indian AI startups, Sarvam, Indian regulation). Skip anything you cannot verify.

Return ONLY a JSON array (no markdown fences, no commentary, no trailing commas) where each item has
EXACTLY this shape:
{
  "title": "headline in your own words, not copied from the source",
  "dek": "one-line subtitle",
  "summary": "2 sentences",
  "whatHappened": "3-4 sentences, facts only",
  "importantDetails": ["3-5 short factual bullets with real numbers or dates"],
  "whyItMatters": "2-3 sentences of analysis",
  "category": "one of: ${CATEGORIES.join(', ')}",
  "source": "publisher name",
  "sourceUrl": "the real URL of the article you found",
  "tags": ["3-5 short tags"],
  "significance": 72
}
"significance" is your own 0-100 estimate of how important the story is (flagship model launch or major
funding/regulation = 85-100; solid product or research news = 55-84; minor update = below 55).
Write everything in your own words — do not copy sentences from the source.`;

async function callGeminiOnce(model) {
  const url = API_URL.replace(/models\/[^:?/]+/, `models/${model}`);
  const body = {
    contents: [{ role: 'user', parts: [{ text: PROMPT }] }],
  };
  if (USE_GROUNDING) {
    body.tools = [{ google_search: {} }];
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000), // give up on a single request after 2 minutes
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini API error ${res.status}: ${errText.slice(0, 500)}`);
  }
  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? '')
    .join('');
  if (!text.trim()) throw new Error('Gemini returned an empty response.');
  return text;
}

async function callGemini() {
  let lastErr;
  for (const model of MODELS) {
    for (let i = 1; i <= 2; i++) {
      try {
        console.log(`Trying ${model}, attempt ${i}`);
        return await callGeminiOnce(model);
      } catch (err) {
        lastErr = err;
        // 404 = model not available, 429 = quota: no point retrying, go to the next model.
        if (/error (404|429)/.test(err.message)) {
          console.log(`${model} not available, trying next model`);
          break;
        }
        // 500/503/504 and network problems are temporary: retry once, then go to the next model.
        const retryable = /error (500|503|504)|fetch failed|timeout|aborted/i.test(err.message);
        if (!retryable) throw err;
        console.log(`${model} attempt ${i} failed: ${err.message.slice(0, 120)}`);
        if (i < 2) await new Promise((r) => setTimeout(r, 30000));
      }
    }
  }
  throw lastErr;
}

function extractJsonArray(text) {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('No JSON array found in the model response.');
  }
  return JSON.parse(text.slice(start, end + 1));
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || `article-${Date.now()}`;
}

async function readJsonSafe(filePath, fallback) {
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function daysOld(isoDate) {
  const ms = Date.now() - new Date(isoDate).getTime();
  return Math.max(0, ms / 86_400_000);
}

/** Deterministic score: round((significance + recency) / 2), recomputed every run so old items decay. */
function computeTrendingScore(significance, publishedAt) {
  const recency = Math.max(0, 100 - 2 * daysOld(publishedAt));
  return Math.round((clamp(significance, 0, 100) + recency) / 2);
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
}

function buildArticleRecord(raw, publishedAtIso) {
  const id = slugify(raw.title);
  const significance = clamp(raw.significance, 0, 100);
  return {
    id,
    status: 'published',
    category: CATEGORIES.includes(raw.category) ? raw.category : 'industry',
    title: String(raw.title ?? '').slice(0, 200),
    dek: String(raw.dek ?? '').slice(0, 200),
    summary: String(raw.summary ?? ''),
    whatHappened: String(raw.whatHappened ?? ''),
    importantDetails: Array.isArray(raw.importantDetails) ? raw.importantDetails.slice(0, 6).map(String) : [],
    whyItMatters: String(raw.whyItMatters ?? ''),
    source: String(raw.source ?? 'Unknown'),
    sourceUrl: String(raw.sourceUrl ?? ''),
    publishedAt: publishedAtIso,
    author: 'Newzy AI Desk',
    readMinutes: 3,
    tags: Array.isArray(raw.tags) ? raw.tags.slice(0, 6).map(String) : [],
    featured: false,
    breaking: daysOld(publishedAtIso) < 1 && significance >= 85,
    trendingScore: computeTrendingScore(significance, publishedAtIso),
    imageUrl: null,
    relatedIds: [],
    relatedTopicIds: [],
    relatedModelIds: [],
    relatedToolIds: [],
    _significance: significance, // kept for recompute on later runs; harmless extra field for the app
  };
}

function dedupeKey(title) {
  return slugify(title);
}

async function main() {
  await mkdir(DATA_DIR, { recursive: true });

  const existing = await readJsonSafe(ARTICLES_PATH, []);
  const existingByKey = new Map(existing.map((a) => [dedupeKey(a.title), a]));

  console.log(
    USE_GROUNDING
      ? 'Calling Gemini with Google Search grounding...'
      : 'Calling Gemini WITHOUT Google Search grounding (test mode)...'
  );
  const responseText = await callGemini();
  const rawItems = extractJsonArray(responseText);
  console.log(`Gemini returned ${rawItems.length} candidate items.`);

  const nowIso = new Date().toISOString();
  let added = 0;
  for (const raw of rawItems) {
    if (!raw || typeof raw.title !== 'string' || raw.title.trim().length < 5) continue;
    const key = dedupeKey(raw.title);
    if (existingByKey.has(key)) continue; // already have this story
    const record = buildArticleRecord(raw, nowIso);
    existingByKey.set(key, record);
    added += 1;
  }
  console.log(`Added ${added} new article(s).`);

  // Recompute trending score for every stored article (recency decays over time) and drop stale ones.
  const merged = [...existingByKey.values()]
    .filter((a) => daysOld(a.publishedAt) <= MAX_ARTICLE_AGE_DAYS)
    .map((a) => ({
      ...a,
      trendingScore: computeTrendingScore(a._significance ?? 60, a.publishedAt),
    }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, MAX_STORED_ARTICLES);

  // Mark the 4 most significant recent items as featured; breaking = published in the last 20 hours and significant.
  const byScore = [...merged].sort((a, b) => b.trendingScore - a.trendingScore);
  const featuredIds = new Set(byScore.slice(0, 4).map((a) => a.id));
  for (const a of merged) {
    a.featured = featuredIds.has(a.id);
    a.breaking = daysOld(a.publishedAt) < 0.85 && (a._significance ?? 0) >= 85;
  }

  await writeFile(ARTICLES_PATH, JSON.stringify(merged, null, 2) + '\n');
  console.log(`Wrote ${merged.length} articles to ${ARTICLES_PATH}`);

  // Build the digest in plain JS — no extra AI call needed.
  const topStory = byScore[0];
  const statsByCategory = {};
  for (const a of merged) {
    if (daysOld(a.publishedAt) < 2) statsByCategory[a.category] = (statsByCategory[a.category] ?? 0) + 1;
  }
  const topCategories = Object.entries(statsByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const digest = {
    date: nowIso,
    headline: topStory ? topStory.title.split(' ').slice(0, 6).join(' ') : 'AI news today',
    summary: topStory
      ? `${topStory.dek} ${merged[1] ? merged[1].dek : ''}`.trim()
      : 'No fresh stories were found in the last run.',
    topStoryId: topStory ? topStory.id : '',
    stats: topCategories.length > 0
      ? topCategories.map(([label, value]) => ({ label, value: String(value) }))
      : [{ label: 'Stories tracked', value: String(merged.length) }],
  };

  await writeFile(DIGEST_PATH, JSON.stringify(digest, null, 2) + '\n');
  console.log(`Wrote digest to ${DIGEST_PATH}`);
}

main().catch((err) => {
  console.error('Pipeline failed:', err.message);
  process.exit(1);
});
