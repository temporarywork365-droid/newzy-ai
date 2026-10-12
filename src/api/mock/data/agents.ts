import type { AgentProfile } from '@/types';

export const agents: AgentProfile[] = [
  {
    id: 'devin', name: 'Devin', tagline: 'Autonomous software engineer',
    summary: 'Plans, codes, tests and opens pull requests across an entire repository with minimal supervision.',
    category: 'Coding', autonomy: 'autonomous',
    capabilities: ['Multi-file repo changes', 'Runs its own terminal and tests', 'Opens and iterates on pull requests', 'Long-horizon task planning'],
    frameworks: ['Custom planner', 'Frontier LLMs'], pricingModel: 'Paid', website: 'https://devin.ai',
    tags: ['coding', 'autonomous', 'engineering'],
  },
  {
    id: 'claude-code', name: 'Claude Code', tagline: 'Terminal-native coding agent',
    summary: 'An agentic coding tool that lives in your terminal, reads your repo, and edits files on command.',
    category: 'Coding', autonomy: 'semi-autonomous',
    capabilities: ['Repo-aware edits across files', 'Runs tests and fixes failures', 'Git-native workflows', 'Works in terminal or IDE'],
    frameworks: ['Claude 4'], pricingModel: 'Paid', website: 'https://www.anthropic.com/claude-code',
    tags: ['coding', 'terminal', 'agent'],
  },
  {
    id: 'lindy', name: 'Lindy', tagline: 'No-code AI employees',
    summary: 'Build agents that handle email, meetings and CRM workflows — without writing code.',
    category: 'Operations', autonomy: 'semi-autonomous',
    capabilities: ['Email triage and drafting', 'Meeting scheduling', 'CRM updates', 'Human-in-the-loop approvals'],
    frameworks: ['No-code builder', 'Frontier LLMs'], pricingModel: 'Freemium', website: 'https://www.lindy.ai',
    tags: ['ops', 'no-code', 'automation'],
  },
  {
    id: 'julius', name: 'Julius', tagline: 'Your AI data analyst',
    summary: 'Upload spreadsheets and get analysis, charts and statistical tests through conversation.',
    category: 'Analysis', autonomy: 'assisted',
    capabilities: ['Python-based analysis on your files', 'Chart generation', 'Statistical testing', 'Natural-language querying'],
    frameworks: ['Code interpreter'], pricingModel: 'Freemium', website: 'https://julius.ai',
    tags: ['data', 'analysis', 'charts'],
  },
  {
    id: 'manus', name: 'Manus', tagline: 'General-purpose autonomous agent',
    summary: 'Takes a goal end-to-end: browses, plans, executes multi-step tasks and returns finished deliverables.',
    category: 'General', autonomy: 'autonomous',
    capabilities: ['Autonomous multi-step execution', 'Web browsing and research', 'File and deliverable creation', 'Task decomposition'],
    frameworks: ['Multi-agent planner', 'Frontier LLMs'], pricingModel: 'Paid', website: 'https://manus.im',
    tags: ['general', 'autonomous', 'research'],
  },
];
