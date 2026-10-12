import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { useTheme } from '@/theme/ThemeProvider';
import { toneSoftKey, toneStrongKey } from '@/theme/colors';
import type { Tone } from '@/theme/tokens';
import type { AITool, PromptTemplate, WorkflowDetail, WorkflowStep } from '@/types';

interface WorkflowFlowProps {
  workflow: WorkflowDetail;
  onOpenTool: (toolId: string) => void;
  onOpenPrompt: (promptId: string) => void;
}

/** GOAL → INPUT → STEPS (with tools) → OUTPUT — a vertical chain of native cards. */
export function WorkflowFlow({ workflow, onOpenTool, onOpenPrompt }: WorkflowFlowProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([workflow.steps[0]?.step ?? 1]));

  const toggleStep = (step: number) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
  };

  return (
    <View>
      <FlowNode label="Goal" text={workflow.goal} icon="flag-outline" tone="accent" />
      <FlowArrow />
      <FlowNode label="Input" text={workflow.input} icon="download-outline" tone="info" />
      <FlowArrow />

      {workflow.steps.map((step) => (
        <View key={step.step}>
          <StepNode
            step={step}
            tool={workflow.tools.find((candidate) => candidate.id === step.toolId)}
            prompt={workflow.prompts.find((candidate) => candidate.id === step.promptId)}
            expanded={expanded.has(step.step)}
            onToggle={() => toggleStep(step.step)}
            onOpenTool={onOpenTool}
            onOpenPrompt={onOpenPrompt}
          />
          <FlowArrow />
        </View>
      ))}

      <FlowNode label="Output" text={workflow.expectedOutput} icon="checkmark-circle-outline" tone="success" />
    </View>
  );
}

function FlowNode({ label, text, icon, tone }: { label: string; text: string; icon: keyof typeof Ionicons.glyphMap; tone: Tone }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View style={{
      backgroundColor: colors[toneSoftKey[tone]], borderWidth: 1, borderColor: colors.border,
      borderRadius: radius.md, padding: spacing.md, gap: spacing.xs,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Ionicons name={icon} size={14} color={colors[toneStrongKey[tone]]} />
        <AppText variant="caption" style={{ color: colors[toneStrongKey[tone]], textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </AppText>
      </View>
      <AppText variant="body" color="secondary">{text}</AppText>
    </View>
  );
}

function FlowArrow() {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 2 }}>
      <Ionicons name="arrow-down" size={14} color={colors.textTertiary} />
    </View>
  );
}

function StepNode({
  step, tool, prompt, expanded, onToggle, onOpenTool, onOpenPrompt,
}: {
  step: WorkflowStep;
  tool?: AITool;
  prompt?: PromptTemplate;
  expanded: boolean;
  onToggle: () => void;
  onOpenTool: (toolId: string) => void;
  onOpenPrompt: (promptId: string) => void;
}) {
  const { colors, spacing, radius } = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} step ${step.step}: ${step.title}`}
      style={{
        backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
        borderRadius: radius.lg, padding: spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View style={{
          width: 28, height: 28, borderRadius: 14,
          backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center',
        }}>
          <AppText variant="caption" color="accent">{step.step}</AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="heading" numberOfLines={expanded ? undefined : 1}>{step.title}</AppText>
        </View>
        {step.automatable && !expanded ? (
          <Ionicons name="flash-outline" size={12} color={colors.success} />
        ) : null}
        <Ionicons name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={14} color={colors.textTertiary} />
      </View>

      {!expanded && tool ? (
        <View style={{ marginTop: spacing.xs, marginLeft: 40 }}>
          <Chip label={tool.name} icon="construct-outline" small tone="info" />
        </View>
      ) : null}

      {expanded ? (
        <View style={{ marginTop: spacing.sm, marginLeft: 40 }}>
          <AppText variant="small" color="secondary">{step.detail}</AppText>
          {step.tip ? (
            <View style={{ backgroundColor: colors.infoSoft, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginTop: spacing.sm }}>
              <AppText variant="caption" style={{ color: colors.info }}>Tip · {step.tip}</AppText>
            </View>
          ) : null}
          {tool ? (
            <Pressable onPress={() => onOpenTool(tool.id)} hitSlop={8} accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm }}>
              <Ionicons name="construct-outline" size={13} color={colors.accent} />
              <AppText variant="small" color="accent">Open tool · {tool.name}</AppText>
            </Pressable>
          ) : null}
          {prompt ? (
            <Pressable onPress={() => onOpenPrompt(prompt.id)} hitSlop={8} accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
              <Ionicons name="chatbubble-ellipses-outline" size={13} color={colors.accent} />
              <AppText variant="small" color="accent">Open prompt · {prompt.title}</AppText>
            </Pressable>
          ) : null}
          {step.automatable ? (
            <View style={{ marginTop: spacing.sm }}>
              <Chip label="Automatable" icon="flash-outline" tone="success" small />
            </View>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}
