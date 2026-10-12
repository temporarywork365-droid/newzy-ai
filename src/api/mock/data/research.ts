import type { ResearchPaper } from '@/types';
import { yearsAgo } from './helpers';

export const research: ResearchPaper[] = [
  {
    id: 'attention-is-all-you-need',
    title: 'Attention Is All You Need',
    abstract: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'et al.'],
    institutions: ['Google Brain', 'Google Research'],
    publishedAt: yearsAgo(8), venue: 'NeurIPS 2017',
    url: 'https://arxiv.org/abs/1706.03762',
    significance: 'The paper that introduced the Transformer — the architecture behind virtually every modern LLM. Understand attention and you understand the field\u2019s core engine.',
    keyFindings: [
      'Self-attention replaces recurrence, allowing full parallelization during training.',
      'Quality improved while training cost dropped versus prior sequence models.',
      'The architecture scaled with compute and data far beyond the paper\u2019s original scale.',
    ],
    tags: ['transformers', 'attention', 'foundational'],
  },
  {
    id: 'retrieval-augmented-generation',
    title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
    abstract: 'We explore a general-purpose fine-tuning recipe for retrieval-augmented generation (RAG) — models that combine pre-trained parametric and non-parametric memory.',
    authors: ['Patrick Lewis', 'Ethan Perez', 'et al.'],
    institutions: ['Meta AI', 'UCL', 'NYU'],
    publishedAt: yearsAgo(5), venue: 'NeurIPS 2020',
    url: 'https://arxiv.org/abs/2005.11401',
    significance: 'The origin of RAG — the pattern behind every "chat with your data" product. It trades hallucination for grounded, updatable knowledge.',
    keyFindings: [
      'Retrieval + generation beats fine-tuning alone for knowledge-heavy tasks.',
      'Knowledge can be updated by swapping the document index, not retraining.',
      'Generated text can cite its sources, enabling verification.',
    ],
    tags: ['RAG', 'retrieval', 'grounding'],
  },
  {
    id: 'constitutional-ai',
    title: 'Constitutional AI: Harmlessness from AI Feedback',
    abstract: 'We train a non-evasive and helpful AI assistant that engages with harmful queries by criticizing and revising its own responses using a set of constitutional principles.',
    authors: ['Yuntao Bai', 'et al.'],
    institutions: ['Anthropic'],
    publishedAt: yearsAgo(3), venue: 'arXiv 2022',
    url: 'https://arxiv.org/abs/2212.08073',
    significance: 'Showed that models can be made safer using AI feedback against written principles — reducing reliance on human labelers for alignment.',
    keyFindings: [
      'Self-critique against a constitution measurably reduces harmful outputs.',
      'AI feedback can substitute for much human preference labeling.',
      'The technique generalizes across model families.',
    ],
    tags: ['alignment', 'safety', 'RLHF'],
  },
  {
    id: 'tree-of-thoughts',
    title: 'Tree of Thoughts: Deliberate Problem Solving with LLMs',
    abstract: 'We frame language model reasoning as exploring a tree of intermediate thoughts, enabling lookahead and backtracking.',
    authors: ['Shunyu Yao', 'Dian Yu', 'et al.'],
    institutions: ['Princeton', 'Google DeepMind'],
    publishedAt: yearsAgo(2), venue: 'NeurIPS 2023',
    url: 'https://arxiv.org/abs/2305.10601',
    significance: 'A landmark prompting framework: searching over chains of thought beats a single chain on planning-heavy problems — the ancestor of today\u2019s "reasoning" modes.',
    keyFindings: [
      'Exploring multiple partial solutions improves planning and math tasks.',
      'The model itself can evaluate which branch to expand.',
      'Gains come purely from prompting structure — no retraining required.',
    ],
    tags: ['reasoning', 'prompting', 'planning'],
  },
];
