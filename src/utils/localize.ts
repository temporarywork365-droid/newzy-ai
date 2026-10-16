import type { Article } from '@/types';

export type AppLanguage = 'en' | 'hi';

export interface LocalizedArticle {
  title: string;
  dek: string;
  summary: string;
  whyItMatters: string;
  /** True when the Hindi text is actually being shown (not the English fallback). */
  isHindi: boolean;
}

// The free AI model sometimes writes "Hindi" in English letters (Hinglish). Only real Devanagari counts.
const DEVANAGARI = /[\u0900-\u097F]/;
const isDevanagari = (text?: string): text is string => !!text && DEVANAGARI.test(text);

/** Only articles written by the live pipeline carry Hindi text, and only if it is real Devanagari. */
export const hasHindi = (article: Article): boolean => isDevanagari(article.titleHi) && isDevanagari(article.summaryHi);

const pick = (hindi: string | undefined, english: string): string => (isDevanagari(hindi) ? hindi : english);

/** Picks Hindi when the reader chose it AND the article has it; otherwise English (field by field). */
export function localizeArticle(article: Article, language: AppLanguage): LocalizedArticle {
  if (language === 'hi' && hasHindi(article)) {
    return {
      title: pick(article.titleHi, article.title),
      dek: pick(article.dekHi, article.dek),
      summary: pick(article.summaryHi, article.summary),
      whyItMatters: pick(article.whyItMattersHi, article.whyItMatters),
      isHindi: true,
    };
  }
  return {
    title: article.title,
    dek: article.dek,
    summary: article.summary,
    whyItMatters: article.whyItMatters,
    isHindi: false,
  };
}
