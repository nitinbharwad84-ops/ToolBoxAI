import type { SummarizerTweaks, ResumeRoasterTweaks, EmailPacifierTweaks } from '@/types';

interface PromptPair {
  systemPrompt: string;
  userPrompt: string;
}

// ── Summarizer ────────────────────────────────────────

export function buildSummarizerPrompt(content: string, tweaks: SummarizerTweaks): PromptPair {
  const depthMap: Record<number, string> = {
    1: 'very brief (2-3 sentences max)',
    2: 'brief',
    3: 'standard',
    4: 'detailed',
    5: 'comprehensive and thorough',
  };

  const styleMap: Record<string, string> = {
    bullet: 'Format as bullet points',
    numbered: 'Format as a numbered list',
    prose: 'Write in paragraph prose',
    executive: 'Write as an executive brief with clear sections',
    eli5: 'Explain like I\'m 5 — simple language, no jargon',
  };

  const focusMap: Record<string, string> = {
    entire: 'Summarize the entire document comprehensively',
    decisions: 'Focus only on decisions, conclusions, and recommendations',
    data: 'Focus only on numbers, statistics, and data points',
    actions: 'Focus only on action items and next steps',
    risks: 'Focus only on risks, warnings, and potential issues',
  };

  const audienceMap: Record<string, string> = {
    general: 'Assume a general audience',
    executive: 'Assume the reader is a C-suite executive who needs key takeaways',
    technical: 'Assume the reader is a technical professional',
    student: 'Assume the reader is a university student',
    legal: 'Assume the reader has a legal background and values precision',
  };

  const jsonFields: string[] = [
    '"title": "string — document title or topic"',
    `"key_points": ["array of exactly ${tweaks.keyPoints} key points"]`,
  ];

  if (tweaks.includeTldr) jsonFields.push('"tldr": "string — one-line summary"');
  if (tweaks.includeActionItems) jsonFields.push('"action_items": ["array of action items"]');
  if (tweaks.includeSentiment) jsonFields.push('"sentiment": "string — overall sentiment of the document"');
  if (tweaks.includeStats) jsonFields.push('"key_data_points": ["array of important numbers/stats"]');

  const systemPrompt = [
    'You are a professional document summarizer.',
    `Provide exactly ${tweaks.keyPoints} key points.`,
    styleMap[tweaks.outputStyle],
    focusMap[tweaks.focusArea],
    `Response depth: ${depthMap[tweaks.depth] ?? 'standard'}.`,
    audienceMap[tweaks.audience],
    tweaks.language !== 'English' ? `Respond entirely in ${tweaks.language}.` : '',
    '',
    'Return ONLY valid JSON with this exact schema:',
    '{',
    jsonFields.map((f) => `  ${f}`).join(',\n'),
    '}',
    '',
    'Do NOT include any text outside the JSON object.',
  ]
    .filter(Boolean)
    .join('\n');

  return { systemPrompt, userPrompt: `Summarize this document:\n\n${content}` };
}

// ── Resume Roaster ────────────────────────────────────

export function buildResumeRoasterPrompt(content: string, tweaks: ResumeRoasterTweaks): PromptPair {
  const intensityMap: Record<number, string> = {
    1: 'Be encouraging and supportive, highlight strengths while gently suggesting improvements.',
    2: 'Be constructive with clear critique. Point out issues but be encouraging.',
    3: 'Be direct and honest. Don\'t sugarcoat issues but remain professional.',
    4: 'Be harsh and critical. Point out every flaw without holding back.',
    5: 'Be completely ruthless, spare nothing. Roast every weakness mercilessly.',
  };

  const personaMap: Record<string, string> = {
    marcus: 'You are Marcus, a brutally honest senior tech recruiter who has reviewed 10,000+ resumes. You don\'t sugarcoat. You tell it like it is.',
    coach: 'You are a supportive career coach who wants the best for the candidate. You give actionable, kind but firm feedback.',
    hr: 'You are an experienced HR Manager at a Fortune 500 company. You evaluate resumes objectively against industry standards.',
  };

  const roleStr = tweaks.targetRole === 'auto'
    ? 'Auto-detect the target role from resume content.'
    : tweaks.targetRole === 'custom'
      ? `This person is targeting: ${tweaks.targetRoleCustom}`
      : `This person is applying for ${tweaks.targetRole.toUpperCase()} roles.`;

  const expStr = tweaks.experienceLevel === 'auto'
    ? 'Auto-detect the experience level.'
    : `Evaluate as a ${tweaks.experienceLevel}-level candidate.`;

  const companyStr = tweaks.companyTarget === 'any'
    ? 'Evaluate for general job market.'
    : `Evaluate specifically for ${tweaks.companyTarget} companies.`;

  const enabledSections = Object.entries(tweaks.focusSections)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const jsonFields: string[] = [];
  if (enabledSections.includes('summary')) jsonFields.push('"summary_review": { "score": 0-10, "feedback": "string", "rewrite": "string or null" }');
  if (enabledSections.includes('experience')) jsonFields.push('"experience_review": { "score": 0-10, "feedback": "string", "bullet_rewrites": ["array"] }');
  if (enabledSections.includes('skills')) jsonFields.push('"skills_review": { "score": 0-10, "feedback": "string", "missing_skills": ["array"] }');
  if (enabledSections.includes('education')) jsonFields.push('"education_review": { "score": 0-10, "feedback": "string" }');
  if (enabledSections.includes('atsCheck')) jsonFields.push('"ats_score": { "score": 0-100, "issues": ["array of ATS problems"], "keywords_missing": ["array"] }');
  if (enabledSections.includes('formatting')) jsonFields.push('"formatting_review": { "score": 0-10, "issues": ["array"] }');

  jsonFields.push(`"top_fixes": ["array of exactly ${tweaks.numFixes} most important things to fix, ranked by priority"]`);
  jsonFields.push('"overall_score": 0-100');
  jsonFields.push('"verdict": "string — one-line brutal verdict"');

  const systemPrompt = [
    personaMap[tweaks.persona],
    '',
    intensityMap[tweaks.intensity] ?? intensityMap[3],
    roleStr,
    expStr,
    companyStr,
    '',
    tweaks.rewriteBullets ? 'Rewrite weak bullets with stronger versions.' : 'Flag problems but do NOT rewrite bullets.',
    tweaks.language !== 'English' ? `Respond entirely in ${tweaks.language}.` : '',
    '',
    'Return ONLY valid JSON:',
    '{',
    jsonFields.map((f) => `  ${f}`).join(',\n'),
    '}',
  ]
    .filter(Boolean)
    .join('\n');

  return { systemPrompt, userPrompt: `Review this resume:\n\n${content}` };
}

// ── Email Pacifier ────────────────────────────────────

export function buildEmailPacifierPrompt(email: string, tweaks: EmailPacifierTweaks): PromptPair {
  const toneMap: Record<string, string> = {
    professional: 'Rewrite in a professional, neutral tone that is clear and respectful.',
    warm: 'Rewrite in a warm, empathetic tone that acknowledges feelings and builds rapport.',
    firm: 'Rewrite in a firm but polite tone that doesn\'t back down but stays respectful.',
    apologetic: 'Rewrite in a sincere apologetic tone that takes accountability.',
    assertive: 'Rewrite in an assertive, confident tone that clearly states expectations.',
  };

  const relationshipMap: Record<string, string> = {
    colleague: 'The recipient is a peer/colleague.',
    manager: 'The recipient is the sender\'s direct manager.',
    report: 'The recipient is the sender\'s direct report.',
    client: 'The recipient is an external client.',
    vendor: 'The recipient is an external vendor/supplier.',
    stranger: 'The recipient is unknown or first-time contact.',
  };

  const goalMap: Record<string, string> = {
    resolve: 'The primary goal is to resolve the issue amicably.',
    apology: 'The primary goal is to get an apology or acknowledgment.',
    urgent: 'The primary goal is to request urgent action.',
    boundary: 'The primary goal is to firmly set a professional boundary.',
    escalate: 'The primary goal is to escalate the matter appropriately.',
  };

  const jsonFields: string[] = [];
  for (let i = 1; i <= tweaks.alternatives; i++) {
    jsonFields.push(`"version_${i}": { "subject": "string", "body": "string", "tone_used": "string" }`);
  }
  jsonFields.push('"original_issues": ["array of problems identified in the original email"]');
  jsonFields.push('"diplomacy_tips": ["array of 2-3 communication tips relevant to this situation"]');

  const systemPrompt = [
    'You are an expert email communication specialist who transforms aggressive, passive-aggressive, or poorly-worded emails into professional, effective communication.',
    '',
    toneMap[tweaks.tone],
    relationshipMap[tweaks.relationship],
    goalMap[tweaks.goal],
    '',
    tweaks.preserveDemands ? 'The rewritten email MUST still clearly make the same request/demand as the original.' : 'You may soften demands if it improves the tone.',
    tweaks.senderName ? `Sign the email as: ${tweaks.senderName}` : 'Do not add a signature.',
    tweaks.context ? `Additional context: ${tweaks.context}` : '',
    tweaks.language !== 'English' ? `Respond entirely in ${tweaks.language}.` : '',
    `Generate exactly ${tweaks.alternatives} alternative version(s).`,
    tweaks.length <= 2 ? 'Keep responses SHORT — remove filler, get to the point.' : tweaks.length >= 4 ? 'Write DETAILED responses — preserve full context and nuance.' : '',
    '',
    'Return ONLY valid JSON:',
    '{',
    jsonFields.map((f) => `  ${f}`).join(',\n'),
    '}',
  ]
    .filter(Boolean)
    .join('\n');

  return { systemPrompt, userPrompt: `Transform this email:\n\n${email}` };
}
