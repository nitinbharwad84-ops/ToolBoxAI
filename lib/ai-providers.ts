import type { AIProvider, AIExecutionResult } from '@/types';
import { decrypt } from './encryption';
import { getServiceSupabase } from './supabase';

// ── Provider Configurations ───────────────────────────

const providers: AIProvider[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    model: 'gemini-2.0-flash',
    apiKeyEnv: 'GEMINI_API_KEY',
    maxRetries: 2,
    timeout: 30000,
    freeLimit: 'Generous free tier',
    formatRequest: (prompt: string, systemPrompt: string) => ({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
      }),
    }),
    parseResponse: (data: unknown): string => {
      const d = data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      return d?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    },
  },
  {
    id: 'grok',
    name: 'Grok',
    baseUrl: 'https://api.x.ai/v1/chat/completions',
    model: 'grok-3-mini',
    apiKeyEnv: 'GROK_API_KEY',
    maxRetries: 2,
    timeout: 30000,
    freeLimit: 'Free tier available',
    formatRequest: (prompt: string, systemPrompt: string) => ({
      url: 'https://api.x.ai/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    }),
    parseResponse: (data: unknown): string => {
      const d = data as { choices?: Array<{ message?: { content?: string } }> };
      return d?.choices?.[0]?.message?.content ?? '';
    },
  },
  {
    id: 'groq',
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.1-70b-versatile',
    apiKeyEnv: 'GROQ_API_KEY',
    maxRetries: 2,
    timeout: 30000,
    freeLimit: 'Free, very fast inference',
    formatRequest: (prompt: string, systemPrompt: string) => ({
      url: 'https://api.groq.com/openai/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    }),
    parseResponse: (data: unknown): string => {
      const d = data as { choices?: Array<{ message?: { content?: string } }> };
      return d?.choices?.[0]?.message?.content ?? '';
    },
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    apiKeyEnv: 'OPENROUTER_API_KEY',
    maxRetries: 2,
    timeout: 30000,
    freeLimit: 'Free models available',
    formatRequest: (prompt: string, systemPrompt: string) => ({
      url: 'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'ToolboxAI',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      }),
    }),
    parseResponse: (data: unknown): string => {
      const d = data as { choices?: Array<{ message?: { content?: string } }> };
      return d?.choices?.[0]?.message?.content ?? '';
    },
  },
  {
    id: 'mistral',
    name: 'Mistral',
    baseUrl: 'https://api.mistral.ai/v1/chat/completions',
    model: 'mistral-small-latest',
    apiKeyEnv: 'MISTRAL_API_KEY',
    maxRetries: 2,
    timeout: 30000,
    freeLimit: 'Free tier available',
    formatRequest: (prompt: string, systemPrompt: string) => ({
      url: 'https://api.mistral.ai/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    }),
    parseResponse: (data: unknown): string => {
      const d = data as { choices?: Array<{ message?: { content?: string } }> };
      return d?.choices?.[0]?.message?.content ?? '';
    },
  },
];

// ── Single Provider Call ──────────────────────────────

async function callProvider(
  provider: AIProvider,
  prompt: string,
  systemPrompt: string,
): Promise<string> {
  const { url, headers, body } = provider.formatRequest(prompt, systemPrompt);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), provider.timeout);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      const status = response.status;
      throw new Error(`PROVIDER_ERROR:${status}`);
    }

    const data = await response.json();
    return provider.parseResponse(data);
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── User Key Call ─────────────────────────────────────

async function callWithUserKey(
  userProvider: string,
  encryptedKey: string,
  prompt: string,
  systemPrompt: string,
): Promise<string> {
  const apiKey = decrypt(encryptedKey);
  const url = userProvider === 'gemini'
    ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
    : getProviderUrl(userProvider);

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userProvider !== 'gemini') headers.Authorization = `Bearer ${apiKey}`;

  const body = userProvider === 'gemini'
    ? JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
      })
    : JSON.stringify({
        model: getProviderModel(userProvider),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });

  const response = await fetch(url, { method: 'POST', headers, body });
  if (!response.ok) throw new Error(`USER_KEY_ERROR:${response.status}`);

  const data = await response.json();
  const provider = providers.find((p) => p.id === userProvider);
  return provider?.parseResponse(data) ?? JSON.stringify(data);
}

function getProviderUrl(id: string): string {
  return providers.find((p) => p.id === id)?.baseUrl ?? '';
}

function getProviderModel(id: string): string {
  return providers.find((p) => p.id === id)?.model ?? '';
}

// ── Fallback Execution ───────────────────────────────

export async function executeWithFallback(
  prompt: string,
  systemPrompt: string,
  clerkId: string,
): Promise<AIExecutionResult> {
  const startTime = Date.now();
  const supabase = getServiceSupabase();

  // Check for user's own API key
  const { data: user } = await supabase
    .from('users')
    .select('user_api_provider, user_api_key_encrypted')
    .eq('clerk_id', clerkId)
    .single();

  if (user?.user_api_key_encrypted && user?.user_api_provider) {
    try {
      const result = await callWithUserKey(user.user_api_provider, user.user_api_key_encrypted, prompt, systemPrompt);
      return {
        result,
        provider: `user_key (${user.user_api_provider})`,
        deductCredits: false,
        processingTimeMs: Date.now() - startTime,
      };
    } catch (err) {
      console.warn('User API key failed, falling back to system providers:', err);
    }
  }

  // System provider fallback chain
  const errors: string[] = [];

  for (const provider of providers) {
    if (!process.env[provider.apiKeyEnv]) continue;

    for (let attempt = 0; attempt < provider.maxRetries; attempt++) {
      try {
        const result = await callProvider(provider, prompt, systemPrompt);
        if (result) {
          return {
            result,
            provider: provider.id,
            deductCredits: true,
            processingTimeMs: Date.now() - startTime,
          };
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${provider.id}: ${message}`);

        // Skip to next provider on rate limit / auth / service errors
        if (message.includes('429') || message.includes('401') || message.includes('503')) {
          break;
        }
      }
    }
  }

  console.error('All AI providers failed:', errors);
  throw new Error('SERVICE_UNAVAILABLE');
}
