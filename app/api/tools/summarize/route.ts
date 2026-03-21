import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServiceSupabase } from '@/lib/supabase';
import { calculateCreditCost } from '@/lib/credit-calculator';
import { buildSummarizerPrompt } from '@/lib/prompt-builder';
import { executeWithFallback } from '@/lib/ai-providers';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { sanitizeText, validateTweaks } from '@/lib/validate';
import type { SummarizerTweaks } from '@/types';
import { extractTextFromFile } from '@/lib/file-extractor';

const DEFAULT_TWEAKS: SummarizerTweaks = {
  keyPoints: 5,
  outputStyle: 'bullet',
  focusArea: 'entire',
  depth: 3,
  audience: 'general',
  language: 'English',
  includeTldr: true,
  includeActionItems: true,
  includeSentiment: false,
  includeStats: true,
};

const MAX_FILE_SIZE_FREE = 3 * 1024 * 1024; // Lowering to 3MB for Vercel's 4.5MB payload limit
const MAX_FILE_SIZE_PRO = 25 * 1024 * 1024;

export async function POST(req: Request) {
  const startTime = Date.now();
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { allowed, resetIn } = rateLimit(clerkId, 'tool');
  if (!allowed) return rateLimitResponse(resetIn);

  const supabase = getServiceSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  console.log('[API] Summarize request started');
  let body;
  try {
    body = await req.json();
  } catch (err) {
    console.error('[API] Failed to parse request JSON:', err);
    return NextResponse.json({ error: 'INVALID_JSON', message: 'The request body is malformed or too large for the server to process.' }, { status: 400 });
  }

  let content = sanitizeText(body.content);
  const tweaks: SummarizerTweaks = { ...DEFAULT_TWEAKS, ...validateTweaks(body.tweaks) };
  let fileName: string | null = null;
  let fileSize: number | null = null;
  let fileType: string | null = null;

  // Handle file upload (base64-encoded)
  if (body.fileBase64 && body.fileName) {
    const buffer = Buffer.from(body.fileBase64, 'base64');
    fileSize = buffer.length;
    fileName = body.fileName;
    fileType = body.fileType ?? 'unknown';

    const maxSize = user.plan === 'pro' ? MAX_FILE_SIZE_PRO : MAX_FILE_SIZE_FREE;
    if (fileSize > maxSize) {
      return NextResponse.json({
        error: 'FILE_TOO_LARGE',
        message: `File exceeds ${user.plan === 'pro' ? '25' : '3'}MB limit.${user.plan === 'free' ? ' Upgrade to Pro for larger files.' : ''}`,
      }, { status: 400 });
    }

    // Robust File Extraction
    try {
      content = await extractTextFromFile(buffer, fileName || 'file', fileType || 'application/octet-stream');
      console.log(`[API] Extracted content from ${fileName}. Length: ${content?.length}`);
    } catch (err: unknown) {
      console.error('[API] File Extraction Error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      
      // Special handling for spreadsheet which is just a placeholder logic currently
      if (msg.includes('spreadsheet')) {
        content = `[Spreadsheet file: ${fileName}] — Spreadsheet parsing is coming soon.`;
      } else {
        return NextResponse.json({ 
          error: 'FILE_PARSE_ERROR', 
          message: `Failed to extract text from ${fileName}. ${msg}` 
        }, { status: 400 });
      }
    }
  }

  if (!content) {
    return NextResponse.json({ error: 'EMPTY_INPUT', message: 'Please paste your content or upload a file.' }, { status: 400 });
  }

  const cost = calculateCreditCost('summarizer', tweaks);

  if (user.credits < cost) {
    return NextResponse.json({
      error: 'INSUFFICIENT_CREDITS',
      required: cost,
      current: user.credits,
      message: `You need ${cost} credits but have ${user.credits}.`,
    }, { status: 402 });
  }

  const { systemPrompt, userPrompt } = buildSummarizerPrompt(content, tweaks);

  let aiResult;
  try {
    aiResult = await executeWithFallback(userPrompt, systemPrompt, clerkId);
  } catch {
    return NextResponse.json({
      error: 'SERVICE_UNAVAILABLE',
      message: 'Our AI providers are temporarily unavailable. No credits were charged.',
    }, { status: 503 });
  }

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

  let parsedResult;
  try {
    parsedResult = JSON.parse(aiResult.result);
  } catch {
    parsedResult = { raw_output: aiResult.result };
  }

  let historyId = null;
  if (user.auto_save_history) {
    const { data: history } = await supabase
      .from('tool_history')
      .insert({
        user_id: user.id,
        clerk_id: clerkId,
        tool_name: 'summarizer',
        tool_display_name: 'Summarizer',
        input_data: { content: content.slice(0, 5000) },
        input_preview: content.slice(0, 200),
        output_data: parsedResult,
        tweaks_used: tweaks,
        ai_provider_used: aiResult.provider,
        credits_used: aiResult.deductCredits ? cost : 0,
        processing_time_ms: Date.now() - startTime,
        status: 'success',
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType,
      })
      .select('id')
      .single();
    historyId = history?.id;
  }

  if (aiResult.deductCredits) {
    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      clerk_id: clerkId,
      type: 'tool_use',
      amount: -cost,
      balance_after: remaining,
      description: `Summarizer — ${tweaks.keyPoints} key points, ${tweaks.language}`,
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
