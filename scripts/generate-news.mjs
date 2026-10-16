#!/usr/bin/env node
/**
 * Newzy AI — daily news pipeline (FREE version, no Google Search grounding).
 *
 * How it works:
 *   1. Downloads real AI news from public RSS feeds (free, no API key needed).
 *   2. Sends those real headlines + snippets to Gemini and asks it to pick the most important
 *      ones and rewrite them in Newzy's article format. Gemini does NOT search the web and does
 *      NOT write links: the link and publisher always come from the RSS feed itself.
 *   3. Merges the result into data/live/articles.json (rolling window, newest first, deduped),
 *      recomputes a deterministic trendingScore, and writes data/live/digest.json.
 *
 * Requires: GEMINI_API_KEY in the environment (GitHub Actions secret in CI).
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
const MODELS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash'];
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODELS[0]}:generateContent?key=${GEMINI_API_KEY}`;

// Public RSS/Atom feeds. A feed that is down or has moved is simply skipped (see the log).
const FEEDS = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
  { name: 'VentureBeat', url: 'https://venturebeat.com/category/ai/feed/' },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed' },
  { name: 'OpenAI', url: 'https://openai.com/news/rss.xml' },
  { name: 'Google AI', url: 'https://blog.google/technology/ai/rss/' },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml' },
  { name: 'Analytics India Magazine', url: 'https://analyticsindiamag.com/feed/' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
];

const FRESH_HOURS = 48; // only consider feed items from the last 48 hours
const MAX_PER_FEED = 8;
const MAX_CANDIDATES = 40; // max items sent to Gemini per run

const DATA_DIR = path.resolve('data/live');
const ARTICLES_PATH = path.join(DATA_DIR, 'articles.json');
const DIGEST_PATH = path.join(DATA_DIR, 'digest.json');

const MAX_STORED_ARTICLES = 80; // rolling window
const MAX_ARTICLE_AGE_DAYS = 30; // drop anything older than this

const CATEGORIES = [
  'ai-models', 'ai-tools', 'research', 'companies', 'startups', 'ai-agents', 'robotics',
  'ai-coding', 'ai-video', 'ai-image', 'ai-audio', 'automation', 'regulation', 'industry', 'india-ai',
];

const todayLabel = new Date().toISOString().slice(0, 10);

/* ----------------------------- RSS / Atom reading ----------------------------- */

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

/** Unwrap CDATA, decode entities, strip HTML tags, collapse whitespace. */
function cleanText(s) {
  if (!s) return '';
  let t = s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  t = decodeEntities(t);
  t = t.replace(/<[^>]*>/g, ' ');
  return t.replace(/\s+/g, ' ').trim();
}

function getTag(block, name) {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i');
  const m = block.match(re);
  return m ? m[1] : '';
}

function getLink(block) {
  // RSS: <link>https://...</link>
  const rss = cleanText(getTag(block, 'link'));
  if (/^https?:\/\//i.test(rss)) return rss;
  // Atom: <link rel="alternate" href="https://..." />
  const links = block.match(/<link\b[^>]*>/gi) ?? [];
  for (const l of links) {
    const href = l.match(/href=["']([^"']+)["']/i);
    const rel = l.match(/rel=["']([^"']+)["']/i);
    if (href && (!rel || rel[1] === 'alternate')) return decodeEntities(href[1]);
  }
  return '';
}

function parseFeed(xml, sourceName) {
  const blocks =
    xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ??
    xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ??
    [];
  const items = [];
  for (const b of blocks) {
    const title = cleanText(getTag(b, 'title'));
    const link = getLink(b);
    const dateRaw = cleanText(
      getTag(b, 'pubDate') || getTag(b, 'published') || getTag(b, 'updated') || getTag(b, 'dc:date')
    );
    const date = new Date(dateRaw);
    if (!title || !link || Number.isNaN(date.getTime())) continue; // cannot verify -> skip
    const snippet = cleanText(
      getTag(b, 'description') || getTag(b, 'summary') || getTag(b, 'content')
    ).slice(0, 450);
    items.push({ source: sourceName, title, link, snippet, publishedAt: date.toISOString() });
  }
  return items;
}

async function fetchFeed(feed) {
  const res = await fetch(feed.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; NewzyBot/1.0; +https://github.com)',
      Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseFeed(await res.text(), feed.name);
}

async function collectFeedItems(knownUrls) {
  const cutoff = Date.now() - FRESH_HOURS * 3_600_000;
  const all = [];
  let okFeeds = 0;
  for (const feed of FEEDS) {
    try {
      const items = await fetchFeed(feed);
      okFeeds += 1;
      const fresh = items
        .filter((i) => new Date(i.publishedAt).getTime() >= cutoff)
        .filter((i) => !knownUrls.has(i.link))
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        .slice(0, MAX_PER_FEED);
      console.log(`Feed OK: ${feed.name} (${items.length} items, ${fresh.length} new & fresh)`);
      all.push(...fresh);
    } catch (err) {
      console.log(`Feed FAILED: ${feed.name} (${String(err.message).slice(0, 80)})`);
    }
  }
  // Dedupe same story across feeds (by normalised title), newest first, then cap.
  const seen = new Set();
  const unique = [];
  for (const item of all.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))) {
    const key = slugify(item.title);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }
  return { items: unique.slice(0, MAX_CANDIDATES), okFeeds };
}

/* --------------------------------- Gemini call --------------------------------- */

function buildPrompt(candidates) {
  const list = candidates
    .map(
      (c, i) =>
        `${i + 1}. [${c.source} | ${c.publishedAt.slice(0, 16).replace('T', ' ')} UTC] ${c.title}\n   ${c.snippet || '(no snippet)'}`
    )
    .join('\n');

  return `You are a careful AI news editor. Today's date is ${todayLabel}.

Below is a numbered list of REAL news items (headline + short snippet) collected from RSS feeds in the last
${FRESH_HOURS} hours. Pick the 6 to 10 most significant items that are genuinely about AI (models, tools, research,
companies, startups, agents, robotics, regulation, AI in India). Ignore items that are not about AI.
If fewer than 6 are AI-related, return only those.

STRICT RULES:
- Use ONLY facts that appear in the headline or snippet of the item. Do NOT add numbers, names, dates or quotes
  that are not in the text. If the snippet is thin, write shorter text instead of guessing.
- Write everything in your own words. Do not copy sentences from the snippet.
- Do NOT write any URL. Refer to the item only by its number in "sourceIndex".
- The Hindi fields must say the same thing as the English fields and add nothing new.
- IMPORTANT: write the Hindi fields with Devanagari letters (for example: "गूगल ने नया मॉडल लॉन्च किया").
  NEVER write Hindi in English/Roman letters (no "ab", "ko", "hai", "kiya"). Only AI terms, company names and
  product names stay in English letters inside the Devanagari sentence.
- "tryThis" is a ready-to-paste prompt (2-4 sentences, in English) that helps a student or professional apply
  the idea of the story with any AI chatbot. Keep it about the topic in general; do not put new facts about
  the story inside it.
- If several items cover the SAME story, pick only the best one of them.

Return ONLY a JSON array (no markdown fences, no commentary, no trailing commas) where each item has
EXACTLY this shape:
{
  "sourceIndex": 3,
  "title": "headline in your own words",
  "dek": "one-line subtitle",
  "summary": "2 sentences",
  "whatHappened": "2-4 sentences, facts from the snippet only",
  "importantDetails": ["2-4 short factual bullets taken from the text"],
  "whyItMatters": "2-3 sentences of analysis (no new facts)",
  "category": "one of: ${CATEGORIES.join(', ')}",
  "tags": ["3-5 short tags"],
  "titleHi": "same headline in simple Hindi",
  "dekHi": "same subtitle in simple Hindi",
  "summaryHi": "same 2-sentence summary in simple Hindi",
  "whyItMattersHi": "same analysis in simple Hindi",
  "tryThis": { "title": "short label, max 6 words", "prompt": "the ready-to-paste prompt" },
  "significance": 72
}
"significance" is your own 0-100 estimate of importance (flagship model launch or major funding/regulation =
85-100; solid product or research news = 55-84; minor update = below 55). Use each sourceIndex at most once.

NEWS ITEMS:
${list}`;
}

async function callGeminiOnce(model, prompt) {
  const url = API_URL.replace(/models\/[^:?/]+/, `models/${model}`);
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    // Ask Gemini for strict JSON output so the reply is always parseable.
    generationConfig: { responseMimeType: 'application/json' },
  };
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
  try {
    return extractJsonArray(text);
  } catch (err) {
    throw new Error(`Gemini returned invalid JSON: ${String(err.message).slice(0, 100)}`);
  }
}

async function callGemini(prompt) {
  let lastErr;
  for (const model of MODELS) {
    for (let i = 1; i <= 2; i++) {
      try {
        console.log(`Trying ${model}, attempt ${i}`);
        return await callGeminiOnce(model, prompt);
      } catch (err) {
        lastErr = err;
        // 404 = model not available, 429 = quota: no point retrying, go to the next model.
        if (/error (404|429)/.test(err.message)) {
          console.log(`${model} not available, trying next model`);
          break;
        }
        // 500/503/504 and network problems are temporary: retry once, then go to the next model.
        const retryable = /error (500|503|504)|fetch failed|timeout|aborted|invalid JSON|empty response/i.test(err.message);
        if (!retryable) throw err;
        console.log(`${model} attempt ${i} failed: ${err.message.slice(0, 120)}`);
        // Overload errors deserve a pause; a broken reply can be retried straight away.
        const waitMs = /invalid JSON|empty response/i.test(err.message) ? 0 : 30000;
        if (i < 2 && waitMs > 0) await new Promise((r) => setTimeout(r, waitMs));
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

/* --------------------------------- Helpers --------------------------------- */

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

/** Returns a trimmed string, or undefined when empty (undefined fields are left out of the JSON file). */
function optText(value, max) {
  const t = typeof value === 'string' ? value.trim() : '';
  return t ? t.slice(0, max) : undefined;
}

// The free model sometimes writes "Hindi" in English letters. Only real Devanagari text is kept.
const DEVANAGARI = /[\u0900-\u097F]/;

/** Returns the four Hindi fields cleaned. If the headline or summary is not real Devanagari, all four are dropped. */
function cleanHindi(source) {
  const titleHi = optText(source.titleHi, 200);
  const summaryHi = optText(source.summaryHi, 600);
  if (!titleHi || !summaryHi || !DEVANAGARI.test(titleHi) || !DEVANAGARI.test(summaryHi)) {
    return { titleHi: undefined, dekHi: undefined, summaryHi: undefined, whyItMattersHi: undefined };
  }
  const dekHi = optText(source.dekHi, 200);
  const whyHi = optText(source.whyItMattersHi, 700);
  return {
    titleHi,
    dekHi: dekHi && DEVANAGARI.test(dekHi) ? dekHi : undefined,
    summaryHi,
    whyItMattersHi: whyHi && DEVANAGARI.test(whyHi) ? whyHi : undefined,
  };
}

function parseTryThis(value) {
  if (!value || typeof value !== 'object') return undefined;
  const title = optText(value.title, 80);
  const prompt = optText(value.prompt, 700);
  return title && prompt ? { title, prompt } : undefined;
}

function buildArticleRecord(raw, publishedAtIso) {
  const id = slugify(raw.title);
  const significance = clamp(raw.significance, 0, 100);
  return {
    id,
    status: 'published',
    category: CATEGORIES.includes(raw.category) ? raw.category : 'industry',
    title: String(raw.title ?? '').slice(0, 200),
    originalTitle: optText(raw.originalTitle, 300), // the publisher's own headline, shown for transparency
    dek: String(raw.dek ?? '').slice(0, 200),
    summary: String(raw.summary ?? ''),
    ...cleanHindi(raw),
    tryThis: parseTryThis(raw.tryThis),
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

/* ----------------------------------- Main ----------------------------------- */

async function main() {
  await mkdir(DATA_DIR, { recursive: true });

  // Clean up articles saved by earlier runs: drop "Hindi" that is really English letters.
  const existing = (await readJsonSafe(ARTICLES_PATH, [])).map((a) => ({ ...a, ...cleanHindi(a) }));
  const existingByKey = new Map(existing.map((a) => [dedupeKey(a.title), a]));
  const knownUrls = new Set(existing.map((a) => a.sourceUrl).filter(Boolean));

  console.log('Reading RSS feeds...');
  const { items: candidates, okFeeds } = await collectFeedItems(knownUrls);
  if (okFeeds === 0) {
    throw new Error('All RSS feeds failed. Check the feed list or your network.');
  }
  console.log(`Collected ${candidates.length} new candidate item(s) from ${okFeeds} feed(s).`);

  let added = 0;
  if (candidates.length > 0) {
    const rawItems = await callGemini(buildPrompt(candidates));
    console.log(`Gemini returned ${rawItems.length} article(s).`);

    const usedIndexes = new Set();
    for (const raw of rawItems) {
      if (!raw || typeof raw.title !== 'string' || raw.title.trim().length < 5) continue;
      const idx = Number(raw.sourceIndex);
      const item = candidates[idx - 1];
      if (!Number.isInteger(idx) || !item || usedIndexes.has(idx)) continue; // must map to a real feed item
      usedIndexes.add(idx);

      const key = dedupeKey(raw.title);
      if (existingByKey.has(key) || knownUrls.has(item.link)) continue;

      // Link, publisher and publish date always come from the feed, never from the model.
      const record = buildArticleRecord(
        { ...raw, source: item.source, sourceUrl: item.link, originalTitle: item.title },
        item.publishedAt
      );
      existingByKey.set(key, record);
      knownUrls.add(item.link);
      added += 1;
    }
  } else {
    console.log('No new items since the last run. Skipping the Gemini call.');
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
    date: new Date().toISOString(),
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
