import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('user_api_provider, user_api_key_encrypted')
    .eq('clerk_id', clerkId)
    .single();

  if (!user?.user_api_key_encrypted || !user?.user_api_provider) {
    return NextResponse.json({ error: 'No API key set' }, { status: 400 });
  }

  try {
    const apiKey = decrypt(user.user_api_key_encrypted);
    const provider = user.user_api_provider;

    // Minimal test prompt
    const startTime = Date.now();
    const testPrompt = 'Reply with exactly: {"test": "ok"}';

    let url: string;
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let body: string;

    if (provider === 'gemini') {
      url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      body = JSON.stringify({
        contents: [{ parts: [{ text: testPrompt }] }],
        generationConfig: { maxOutputTokens: 20 },
      });
    } else {
      const providerUrls: Record<string, string> = {
        grok: 'https://api.x.ai/v1/chat/completions',
        groq: 'https://api.groq.com/openai/v1/chat/completions',
        openrouter: 'https://openrouter.ai/api/v1/chat/completions',
        mistral: 'https://api.mistral.ai/v1/chat/completions',
      };
      const models: Record<string, string> = {
        grok: 'grok-3-mini',
        groq: 'llama-3.1-70b-versatile',
        openrouter: 'meta-llama/llama-3.1-8b-instruct:free',
        mistral: 'mistral-small-latest',
      };

      url = providerUrls[provider] ?? '';
      headers.Authorization = `Bearer ${apiKey}`;
      body = JSON.stringify({
        model: models[provider],
        messages: [{ role: 'user', content: testPrompt }],
        max_tokens: 20,
      });
    }

    const response = await fetch(url, { method: 'POST', headers, body });
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      working: response.ok,
      provider,
      latencyMs,
      status: response.status,
    });
  } catch {
    return NextResponse.json({ working: false, error: 'Key test failed' });
  }
}
