import type {
  AnalysisDimension, PromptAnalysis, PromptImprovement,
  PromptLabCategory, PromptLabResult,
} from '@/types/promptLab';

/**
 * Deterministic heuristic prompt-analysis engine.
 * In production this exact contract is served by the backend (a server-side
 * LLM call using the backend's own keys). The client never holds API keys —
 * it only posts { input, category } and renders the typed result.
 */

const ACTION_VERBS = new Set([
  'create', 'write', 'generate', 'summarize', 'analyze', 'build', 'make', 'translate',
  'explain', 'design', 'develop', 'draft', 'rewrite', 'produce', 'compare', 'evaluate',
  'extract', 'classify', 'compose', 'outline', 'review', 'fix', 'refactor', 'plan',
  'research', 'script', 'convert', 'translate',
]);

const VAGUE_TERMS = [
  'good', 'nice', 'best', 'great', 'cool', 'engaging', 'interesting', 'some',
  'stuff', 'things', 'amazing', 'compelling', 'catchy', 'professional', 'modern',
];

const FORMAT_HINTS = [
  'json', 'table', 'list', 'bullet', 'bullets', 'markdown', 'csv', 'yaml',
  'xml', 'steps', 'script', 'outline', 'email', 'sections', 'paragraphs', 'format',
];

const CONSTRAINT_RE =
  /\b\d+\b|at most|no more than|at least|avoid|don't|do not|must|only|limit|max|maximum|min|minimum|under|between|words|sentences|minutes|characters/i;

const EXAMPLE_HINTS = ['example', 'e.g.', 'for instance', 'like this', 'such as', 'sample'];

const INPUT_RE = /\b(this|the following|below|based on|attached|here is|here's|input)\b|:/i;

const ROLE_RE = /\byou are\b|\bact as\b|\bas an? [a-z]+\b|\bimagine\b/i;

const CONTEXT_RE =
  /\b(audience|beginners?|readers?|users?|customers?|students?|clients?|team|company|channel|our|my)\b/i;

const CATEGORY_KEYWORDS: Record<PromptLabCategory, string[]> = {
  writing: ['article', 'blog', 'email', 'story', 'essay', 'post', 'newsletter', 'write', 'rewrite'],
  coding: ['code', 'bug', 'function', 'typescript', 'javascript', 'python', 'sql', 'refactor', 'test', 'api', 'program', 'debug'],
  research: ['research', 'paper', 'sources', 'cite', 'study', 'literature', 'find', 'report'],
  image: ['image', 'logo', 'illustration', 'photo', 'picture', 'art', 'poster', 'thumbnail', 'midjourney', 'drawing'],
  video: ['video', 'script', 'youtube', 'reel', 'shorts', 'tiktok', 'storyboard', 'voiceover', 'vlog'],
  marketing: ['campaign', 'ad', 'ads', 'seo', 'landing', 'brand', 'slogan', 'tagline', 'promo', 'launch'],
  education: ['lesson', 'teach', 'student', 'curriculum', 'quiz', 'tutorial', 'course', 'exercise', 'classroom'],
  business: ['business', 'strategy', 'pitch', 'deck', 'proposal', 'okr', 'memo', 'stakeholder', 'swot', 'investor'],
  data: ['data', 'csv', 'chart', 'dashboard', 'metrics', 'dataset', 'spreadsheet', 'statistics', 'analyze', 'analysis'],
  'ai-agents': ['agent', 'agents', 'workflow', 'automate', 'automation', 'orchestrate', 'mcp', 'assistant', 'bot'],
};

interface CategoryProfile {
  role: string;
  outputFormat: string[];
  constraints: string[];
}

const CATEGORY_PROFILES: Record<PromptLabCategory, CategoryProfile> = {
  writing: {
    role: 'a senior editorial writer known for clear, engaging prose',
    outputFormat: ['A headline', '2–4 subheaded sections', 'A closing line with one takeaway'],
    constraints: ['Length: {{length}}', 'Tone: {{tone}}', 'No filler phrases or clichés'],
  },
  coding: {
    role: 'a pragmatic senior engineer who writes production-ready code',
    outputFormat: ['Complete code in a single block', 'Inline comments only where non-obvious', 'A short usage example at the end'],
    constraints: ['Language/stack: {{stack}}', 'Handle errors explicitly', 'No pseudo-code'],
  },
  research: {
    role: 'a rigorous research analyst who cites every claim',
    outputFormat: ['A 3-sentence executive summary', 'Findings under clear headings', '"Open questions" at the end'],
    constraints: ['Flag every claim needing a citation as [CITE]', 'If information may be outdated, say so', 'Neutral tone, zero filler'],
  },
  image: {
    role: 'an expert prompt writer for image-generation models',
    outputFormat: ['One refined image prompt', 'A short list of negative prompts to exclude'],
    constraints: ['Style: {{style}}', 'Framing / aspect ratio: {{framing}}', 'Keep the prompt under 60 words'],
  },
  video: {
    role: 'a professional video scriptwriter for {{platform}} channels',
    outputFormat: ['A hook (first 5 seconds)', 'Script body with timestamps', 'A closing call-to-action'],
    constraints: ['Duration: {{duration}}', 'Hook must name a concrete payoff', 'Spoken style — write for the ear'],
  },
  marketing: {
    role: 'a direct-response marketing copywriter',
    outputFormat: ['3 headline variants', 'Body copy', 'One clear CTA line'],
    constraints: ['Offer/audience: {{audience}}', 'One CTA only', 'No buzzwords'],
  },
  education: {
    role: 'a patient teacher who explains one concept at a time',
    outputFormat: ['A one-line definition', 'A simple explanation with one analogy', 'A worked example', 'A 3-question self-check'],
    constraints: ['Audience level: {{level}}', 'One concept per section', 'No unexplained jargon'],
  },
  business: {
    role: 'a senior strategy consultant who structures thinking',
    outputFormat: ['Executive summary (3 sentences)', 'Structured sections with headers', 'A clear recommendation'],
    constraints: ['Audience: {{audience}}', 'State assumptions explicitly', 'Quantify where possible'],
  },
  data: {
    role: 'a precise data analyst who never invents numbers',
    outputFormat: ['A short summary of what the data shows', 'A table or bullet list of key figures', 'One caveat about data quality'],
    constraints: ['Source: {{source}}', 'Missing values → "unknown", never guessed', 'No fabricated statistics'],
  },
  'ai-agents': {
    role: 'an agent architect who designs reliable tool-using systems',
    outputFormat: ['Goal in one sentence', 'Step-by-step plan', 'Tools & permissions needed', 'Failure handling'],
    constraints: ['Scope: {{scope}}', 'Prefer the fewest tools that work', 'Include a human checkpoint'],
  },
};

/* ── helpers ───────────────────────────────── */

function detectCategory(lower: string, tokens: Set<string>): PromptLabCategory {
  let best: PromptLabCategory = 'writing';
  let bestScore = 0;
  (Object.keys(CATEGORY_KEYWORDS) as PromptLabCategory[]).forEach((categoryKey) => {
    const score = CATEGORY_KEYWORDS[categoryKey].reduce(
      (acc, keyword) => acc + (tokens.has(keyword) ? 1 : 0),
      0,
    );
    if (score > bestScore) { bestScore = score; best = categoryKey; }
  });
  return best;
}

function extractTask(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  const firstSentence = trimmed.split(/[.!?]/)[0] ?? trimmed;
  const cleaned = firstSentence.replace(/^(please|kindly|hey|hi)\s+/i, '').trim();
  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return capitalized.endsWith('.') ? capitalized : `${capitalized}.`;
}

function buildImprovedPrompt(args: {
  task: string;
  rest: string;
  profile: CategoryProfile;
  sentences: string[];
}): string {
  const { task, rest, profile, sentences } = args;
  const lines: string[] = [];

  lines.push(`You are ${profile.role}.`);
  lines.push('');
  lines.push(`Task: ${task}`);
  lines.push('');
  lines.push('Context:');
  if (rest) lines.push(`- Brief provided: ${rest}`);
  lines.push('- Audience: {{audience}}');
  lines.push('- Goal: {{what a successful result achieves}}');
  lines.push('');
  lines.push('Constraints:');
  sentences.filter((sentence) => /\d/.test(sentence) && CONSTRAINT_RE.test(sentence))
    .forEach((sentence) => lines.push(`- ${sentence}`));
  profile.constraints.forEach((constraint) => lines.push(`- ${constraint}`));
  lines.push('');
  lines.push('Output format:');
  profile.outputFormat.forEach((format) => lines.push(`- ${format}`));

  return lines.join('\n');
}

function buildAdvancedPrompt(improved: string): string {
  return [
    improved,
    '',
    'Reasoning:',
    '- Think step by step: outline your approach before writing.',
    '',
    'Quality bar:',
    '- Before finalizing, self-review against every constraint above; fix violations silently, then deliver.',
    '',
    'If anything critical is missing:',
    '- Ask up to 2 clarifying questions before proceeding. Otherwise proceed with sensible defaults and mark assumptions with [ASSUMPTION].',
  ].join('\n');
}

/* ── engine ────────────────────────────────── */

export function analyzePrompt(input: string, requestedCategory?: PromptLabCategory): PromptLabResult {
  const text = input.trim();
  const lower = text.toLowerCase();
  const tokens = new Set(lower.split(/[^a-z0-9']+/).filter(Boolean));
  const wordList = lower.split(/\s+/).filter(Boolean);
  const wordCount = wordList.length;
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const firstWord = (wordList[0] ?? '').replace(/[^a-z]/g, '');

  const categoryAutoDetected = !requestedCategory;
  const category = requestedCategory ?? detectCategory(lower, tokens);

  const present = {
    role: ROLE_RE.test(text),
    task: ACTION_VERBS.has(firstWord) || [...ACTION_VERBS].some((verb) => tokens.has(verb)),
    constraints: CONSTRAINT_RE.test(text),
    input: INPUT_RE.test(text),
    examples: EXAMPLE_HINTS.some((hint) => lower.includes(hint)),
    outputFormat: FORMAT_HINTS.some((hint) => tokens.has(hint)),
    context: CONTEXT_RE.test(lower) || wordCount >= 35,
  };

  const dimensions: AnalysisDimension[] = [
    { key: 'role', present: present.role, note: present.role ? 'A role or persona is set — tone and depth have an anchor.' : 'No role — the model guesses expertise level and voice.' },
    { key: 'context', present: present.context, note: present.context ? 'Some audience/background signals detected.' : 'No audience or background — the model invents its own reader.' },
    { key: 'task', present: present.task, note: present.task ? 'A clear action verb leads the request.' : 'No explicit action verb — the task is implicit and easy to misread.' },
    { key: 'constraints', present: present.constraints, note: present.constraints ? 'Some limits or quantities are specified.' : 'No length, tone or exclusions — output size is unpredictable.' },
    { key: 'input', present: present.input, note: present.input ? 'Material to work from is referenced.' : 'Nothing to work from — the model invents its own inputs.' },
    { key: 'examples', present: present.examples, note: present.examples ? 'At least one example is referenced.' : 'No example of a good result — format is guesswork.' },
    { key: 'output-format', present: present.outputFormat, note: present.outputFormat ? 'An output shape is named (list, table, script…).' : 'No output contract — structure varies run to run.' },
  ];

  /* Ambiguity detection */
  const ambiguities: string[] = [];
  const vagueFound = VAGUE_TERMS.filter((term) => tokens.has(term));
  if (vagueFound.length > 0) {
    ambiguities.push(`Vague wording: "${vagueFound.slice(0, 3).join('", "')}" — replace with measurable criteria.`);
  }
  if (!/\d/.test(text)) ambiguities.push('No length, duration or quantity anywhere — the model will pick one at random.');
  if (!CONTEXT_RE.test(lower)) ambiguities.push('No audience mentioned — "engaging" or "clear" means different things to different readers.');
  if (/\babout (ai|artificial intelligence|technology|business|science|history|health|money)\b/i.test(text)) {
    ambiguities.push('The topic is extremely broad — narrow it to one angle or subfield.');
  }
  if (/\b(it|this|that)\b/i.test(text) && wordCount < 15) {
    ambiguities.push('Pronouns like "it/this" may lack a clear referent.');
  }

  /* Missing information */
  const missingInfo: string[] = [];
  if (!present.role) missingInfo.push('Who the model should be (role / persona)');
  if (!present.context) missingInfo.push('Target audience and their background');
  if (!present.constraints) missingInfo.push('Desired length, format limits, or things to avoid');
  if (!present.input) missingInfo.push('The material to work from (paste or describe it)');
  if (!present.examples) missingInfo.push('An example of a good result');
  if (!present.outputFormat) missingInfo.push('The exact output format (sections, JSON, table…)');

  /* Structure analysis */
  const structureNotes: string[] = [];
  structureNotes.push(`${wordCount} words, ${sentences.length} sentence${sentences.length === 1 ? '' : 's'}.`);
  structureNotes.push(present.task
    ? 'Opens with a clear action verb — good.'
    : 'Does not open with an action verb; the task is implicit.');
  structureNotes.push(text.includes(':') || text.includes('\n')
    ? 'Has some structure (colons / line breaks).'
    : 'One unstructured block — no sections or delimiters.');
  if (wordCount < 8) structureNotes.push('Very short — under-specified for a generative task.');

  const profile = CATEGORY_PROFILES[category];
  const task = extractTask(text);
  const rest = sentences.slice(1).join(' ').trim();
  const improvedPrompt = buildImprovedPrompt({ task, rest, profile, sentences });
  const advancedPrompt = buildAdvancedPrompt(improvedPrompt);

  const improvements: PromptImprovement[] = [];
  if (!present.role) improvements.push({ area: 'Added a role', explanation: `"${profile.role}" anchors vocabulary, depth and voice instead of the model guessing.` });
  if (!present.context) improvements.push({ area: 'Added context slots', explanation: 'Audience and goal placeholders stop the model from inventing its own reader.' });
  if (!present.constraints) improvements.push({ area: 'Added explicit constraints', explanation: 'Length, tone and exclusions make output size and style predictable.' });
  if (!present.input) improvements.push({ area: 'Marked where input belongs', explanation: 'The structure shows where source material goes, so the model works on your data — not imagined data.' });
  if (!present.examples) improvements.push({ area: 'Reserved a few-shot slot', explanation: 'An example of the desired output is the single strongest format signal you can give a model.' });
  if (!present.outputFormat) improvements.push({ area: 'Defined the output contract', explanation: `A fixed ${category}-tuned structure, so every run returns the same shape.` });
  improvements.push({ area: 'Placeholder variables', explanation: '{{variables}} mark exactly what you must fill in — the model sees a complete, valid prompt either way.' });
  improvements.push({ area: 'Reasoning + self-review (advanced version)', explanation: 'The advanced variant asks the model to plan before writing and check its output against every constraint — the two cheapest reliability wins.' });

  const techniques: string[] = ['Role assignment', 'Task isolation', 'Output contract', 'Placeholder variables'];
  if (!present.constraints) techniques.push('Explicit constraints');
  if (!present.examples) techniques.push('Few-shot slot');
  techniques.push('Chain-of-thought', 'Self-critique pass', 'Clarifying-questions gate');

  const presentCount = dimensions.filter((dimension) => dimension.present).length;
  const score = Math.min(100, 20 + presentCount * 11 + (ambiguities.length === 0 ? 8 : 0));

  const analysis: PromptAnalysis = {
    dimensions, ambiguities: ambiguities.slice(0, 4), missingInfo,
    structureNotes, category, categoryAutoDetected, score,
  };

  return {
    id: `pl-${Date.now().toString(36)}`,
    input: text,
    category,
    analysis,
    improvedPrompt,
    advancedPrompt,
    improvements,
    techniques,
    createdAt: new Date().toISOString(),
  };
}
