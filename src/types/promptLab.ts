/** Prompt Engineering Lab — the analysis-engine contract (backend). */

export type PromptLabCategory =
  | 'writing' | 'coding' | 'research' | 'image' | 'video'
  | 'marketing' | 'education' | 'business' | 'data' | 'ai-agents';

export type AnalysisDimensionKey =
  | 'role' | 'context' | 'task' | 'constraints' | 'input' | 'examples' | 'output-format';

export interface AnalysisDimension {
  key: AnalysisDimensionKey;
  present: boolean;
  note: string;
}

export interface PromptAnalysis {
  dimensions: AnalysisDimension[];
  ambiguities: string[];
  missingInfo: string[];
  structureNotes: string[];
  category: PromptLabCategory;
  categoryAutoDetected: boolean;
  score: number; // 0–100 prompt strength
}

export interface PromptImprovement {
  area: string;
  explanation: string;
}

export interface PromptLabResult {
  id: string;
  input: string;
  category: PromptLabCategory;
  analysis: PromptAnalysis;
  improvedPrompt: string;
  advancedPrompt: string;
  improvements: PromptImprovement[];
  techniques: string[];
  createdAt: string;
}

/** Local history entry (persisted on-device, like saved items). */
export interface PromptHistoryItem {
  id: string;
  input: string;
  category: PromptLabCategory;
  improvedPrompt: string;
  advancedPrompt: string;
  createdAt: number;
}
