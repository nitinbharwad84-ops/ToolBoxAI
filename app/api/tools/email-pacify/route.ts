import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { calculateCreditCost } from '@/lib/credit-calculator';
import { buildEmailPacifierPrompt } from '@/lib/prompt-builder';
import { executeWithFallback } from '@/lib/ai-providers';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { sanitizeText, validateTweaks } from '@/lib/validate';
import type { EmailPacifierTweaks } from '@/types';

const DEFAULT_TWEAKS: EmailPacifierTweaks = {
  tone: 'professional',
  relationship: 'colleague',
  goal: 'resolve',
  alternatives: 1,
  length: 3,
  context: '',
  senderName: '',
  preserveDemands: true,
  language: 'English',
};

export async function POST(req: Request) {
  const startTime = Date.now();
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { allowed, resetIn } = rateLimit(clerkId, 'tool');
  if (!allowed) return rateLimitResponse(resetIn);

  const supabase = getServiceSupabase();

  // Load user
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Parse input
  const body = await req.json();
  const email = sanitizeText(body.email);
  const tweaks: EmailPacifierTweaks = { ...DEFAULT_TWEAKS, ...validateTweaks(body.tweaks) };

  if (!email) {
    return NextResponse.json({ error: 'EMPTY_INPUT', message: 'Please paste your email content.' }, { status: 400 });
  }

  // Calculate cost
  const cost = calculateCreditCost('email_pacifier', tweaks);

  if (user.credits < cost) {
    return NextResponse.json({
      error: 'INSUFFICIENT_CREDITS',
      message: `You need ${cost} credits but have ${user.credits}.`,
      required: cost,
      current: user.credits,
    }, { status: 402 });
  }

  // Build prompt & execute
  const { systemPrompt, userPrompt } = buildEmailPacifierPrompt(email, tweaks);

  let aiResult;
  try {
    aiResult = await executeWithFallback(userPrompt, systemPrompt, clerkId);
  } catch {
    return NextResponse.json({
      error: 'SERVICE_UNAVAILABLE',
      message: 'Our AI providers are temporarily unavailable. No credits were charged.',
    }, { status: 503 });
  }

  // Deduct credits
  let remaining = user.credits;
  if (aiResult.deductCredits) {
    const { data: deductResult } = await supabase.rpc('deduct_credits', {
      p_clerk_id: clerkId,
      p_amount: cost,
    });

    const row = deductResult?.[0] ?? deductResult;
    if (!row?.success) {
      return NextResponse.json({ error: 'INSUFFICIENT_CREDITS', message: row?.error_msg ?? 'Credit deduction failed' }, { status: 402 });
    }
    remaining = row.remaining_credits;
  }

  // Parse result
  let parsedResult;
  try {
    parsedResult = JSON.parse(aiResult.result);
  } catch {
    parsedResult = { raw_output: aiResult.result };
  }

  // Save history
  let historyId = null;
  if (user.auto_save_history) {
    const { data: history } = await supabase
      .from('tool_history')
      .insert({
        user_id: user.id,
        clerk_id: clerkId,
        tool_name: 'email_pacifier',
        tool_display_name: 'Email Pacifier',
        input_data: { email },
        input_preview: email.slice(0, 200),
        output_data: parsedResult,
        tweaks_used: tweaks,
        ai_provider_used: aiResult.provider,
        credits_used: aiResult.deductCredits ? cost : 0,
        processing_time_ms: Date.now() - startTime,
        status: 'success',
      })
      .select('id')
      .single();
    historyId = history?.id;
  }

  // Save transaction
  if (aiResult.deductCredits) {
    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      clerk_id: clerkId,
      type: 'tool_use',
      amount: -cost,
      balance_after: remaining,
      description: `Email Pacifier — ${tweaks.tone} tone, ${tweaks.alternatives} version(s)`,
      tool_history_id: historyId,
    });
  }

  return NextResponse.json({
    result: parsedResult,
    creditsUsed: aiResult.deductCredits ? cost : 0,
    creditsRemaining: remaining,
    provider: aiResult.provider,
    historyId,
    processingTimeMs: Date.now() - startTime,
  });
}
