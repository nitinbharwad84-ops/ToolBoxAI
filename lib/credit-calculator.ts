import type { SummarizerTweaks, ResumeRoasterTweaks, EmailPacifierTweaks, ToolName } from '@/types';

export function calculateCreditCost(
  tool: ToolName,
  tweaks: SummarizerTweaks | ResumeRoasterTweaks | EmailPacifierTweaks,
): number {
  switch (tool) {
    case 'summarizer':
      return calculateSummarizerCost(tweaks as SummarizerTweaks);
    case 'resume_roaster':
      return calculateRoasterCost(tweaks as ResumeRoasterTweaks);
    case 'email_pacifier':
      return calculatePacifierCost(tweaks as EmailPacifierTweaks);
    default:
      return 10;
  }
}

function calculateSummarizerCost(tweaks: SummarizerTweaks): number {
  let cost = 10;
  if (tweaks.keyPoints === 3) cost -= 2;
  if (tweaks.keyPoints === 7) cost += 1;
  if (tweaks.keyPoints === 10) cost += 3;
  if (tweaks.depth > 3) cost += (tweaks.depth - 3) * 1;
  if (tweaks.language !== 'English') cost += 2;
  return Math.max(cost, 5);
}

function calculateRoasterCost(tweaks: ResumeRoasterTweaks): number {
  let cost = 15;
  if (tweaks.numFixes === 5) cost += 2;
  if (tweaks.numFixes === 10) cost += 5;
  if (tweaks.language !== 'English') cost += 2;
  return Math.max(cost, 15);
}

function calculatePacifierCost(tweaks: EmailPacifierTweaks): number {
  let cost = 5;
  if (tweaks.alternatives === 2) cost += 2;
  if (tweaks.alternatives === 3) cost += 4;
  if (tweaks.length === 5) cost += 1;
  if (tweaks.language !== 'English') cost += 2;
  return Math.max(cost, 5);
}
