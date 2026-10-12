import { Share } from 'react-native';
import type { WorkflowDetail } from '@/types';

export async function shareText(message: string): Promise<void> {
  try {
    await Share.share({ message });
  } catch {
    // User dismissed the share sheet — nothing to do.
  }
}

export function buildWorkflowShareText(workflow: WorkflowDetail): string {
  return [
    `Newzy AI — Workflow: ${workflow.title}`,
    '',
    `Goal: ${workflow.goal}`,
    `Difficulty: ${workflow.complexity} · ${workflow.estimatedTime}`,
    `Input: ${workflow.input}`,
    `Output: ${workflow.expectedOutput}`,
    '',
    'Steps:',
    ...workflow.steps.map((step) => {
      const tool = workflow.tools.find((t) => t.id === step.toolId);
      return `${step.step}. ${step.title}${tool ? ` — ${tool.name}` : ''}`;
    }),
    '',
    `Tools: ${workflow.tools.map((tool) => tool.name).join(', ')}`,
    '',
    'Shared from Newzy AI',
  ].join('\n');
}
