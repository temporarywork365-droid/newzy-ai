import type { Article } from '@/types';

// Where "Report a mistake" sends people. A pre-filled GitHub issue needs no server or email address.
// To use an email or a Google Form later, change only this file.
const REPORT_REPO = 'temporarywork365-droid/newzy-ai';

export function buildReportUrl(article: Article): string {
  const title = `Mistake in: ${article.title}`;
  const body = [
    'What is wrong with this summary?',
    '',
    '',
    '---',
    `Article id: ${article.id}`,
    `Source: ${article.source}`,
    `Original link: ${article.sourceUrl}`,
  ].join('\n');
  return `https://github.com/${REPORT_REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}
