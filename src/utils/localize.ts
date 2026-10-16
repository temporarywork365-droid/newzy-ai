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

/** Only articles written by the live pipeline carry Hindi text. */
export const hasHindi = (article: Article): boolean => !!(article.titleHi && article.summaryHi);

/** Picks Hindi when the reader chose it AND the article has it; otherwise English. */
export function localizeArticle(article: Article, language: AppLanguage): LocalizedArticle {
  if (language === 'hi' && hasHindi(article)) {
    return {
      title: article.titleHi ?? article.title,
      dek: article.dekHi ?? article.dek,
      summary: article.summaryHi ?? article.summary,
      whyItMatters: article.whyItMattersHi ?? article.whyItMatters,
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
