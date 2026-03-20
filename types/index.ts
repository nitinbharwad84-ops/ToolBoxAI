/* ──────────────────────────────────────────────────────
   ToolboxAI — Shared TypeScript Types
   ────────────────────────────────────────────────────── */

// ── User ──────────────────────────────────────────────

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  plan: 'free' | 'pro';
  credits: number;
  total_credits_used: number;
  razorpay_customer_id: string | null;
  razorpay_subscription_id: string | null;
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'halted';
  subscription_period_end: string | null;
  user_api_provider: string | null;
  user_api_key_encrypted: string | null;
  user_api_key_set_at: string | null;
  default_language: string;
  show_provider_badge: boolean;
  auto_save_history: boolean;
  response_format: 'structured' | 'markdown' | 'plain';
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  plan: 'free' | 'pro';
  credits: number;
  total_credits_used: number;
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'halted';
  user_api_key_set: boolean;
  user_api_provider: string | null;
  default_language: string;
  show_provider_badge: boolean;
  auto_save_history: boolean;
  response_format: 'structured' | 'markdown' | 'plain';
}

// ── Tools ─────────────────────────────────────────────

export type ToolName = 'summarizer' | 'resume_roaster' | 'email_pacifier';

export interface ToolHistory {
  id: string;
  user_id: string;
  clerk_id: string;
  tool_name: ToolName;
  tool_display_name: string;
  input_data: Record<string, unknown>;
  input_preview: string | null;
  output_data: Record<string, unknown>;
  tweaks_used: Record<string, unknown>;
  ai_provider_used: string | null;
  credits_used: number;
  processing_time_ms: number | null;
  status: 'success' | 'failed' | 'pending';
  error_message: string | null;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  created_at: string;
}

// ── Credit Transactions ──────────────────────────────

export type CreditTransactionType =
  | 'purchase'
  | 'subscription_grant'
  | 'tool_use'
  | 'bonus'
  | 'refund'
  | 'initial_grant';

export interface CreditTransaction {
  id: string;
  user_id: string;
  clerk_id: string;
  type: CreditTransactionType;
  amount: number;
  balance_after: number;
  description: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_subscription_id: string | null;
  tool_history_id: string | null;
  created_at: string;
}

// ── Presets ───────────────────────────────────────────

export interface ToolPreset {
  id: string;
  user_id: string;
  clerk_id: string;
  tool_name: ToolName;
  preset_name: string;
  config: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
}

// ── Credit Packages ──────────────────────────────────

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_paise: number;
  razorpay_plan_id: string | null;
  popular: boolean;
  description: string | null;
  active: boolean;
  created_at: string;
}

// ── Subscription Plans ───────────────────────────────

export interface SubscriptionPlan {
  id: string;
  name: string;
  plan_key: string;
  monthly_credits: number;
  price_monthly_paise: number;
  price_yearly_paise: number;
  razorpay_monthly_plan_id: string | null;
  razorpay_yearly_plan_id: string | null;
  features: string[];
  limits: Record<string, unknown>;
  active: boolean;
}

// ── Tweaks ───────────────────────────────────────────

export interface SummarizerTweaks {
  keyPoints: number;
  outputStyle: 'bullet' | 'numbered' | 'prose' | 'executive' | 'eli5';
  focusArea: 'entire' | 'decisions' | 'data' | 'actions' | 'risks';
  depth: number;
  audience: 'general' | 'executive' | 'technical' | 'student' | 'legal';
  language: string;
  includeTldr: boolean;
  includeActionItems: boolean;
  includeSentiment: boolean;
  includeStats: boolean;
}

export interface ResumeRoasterTweaks {
  intensity: number;
  targetRole: 'auto' | 'swe' | 'pm' | 'designer' | 'marketing' | 'finance' | 'custom';
  targetRoleCustom: string;
  experienceLevel: 'auto' | 'entry' | 'mid' | 'senior' | 'executive';
  companyTarget: 'any' | 'faang' | 'startup' | 'consulting' | 'govt';
  focusSections: {
    summary: boolean;
    experience: boolean;
    skills: boolean;
    education: boolean;
    atsCheck: boolean;
    formatting: boolean;
  };
  rewriteBullets: boolean;
  numFixes: number;
  persona: 'marcus' | 'coach' | 'hr';
  language: string;
}

export interface EmailPacifierTweaks {
  tone: 'professional' | 'warm' | 'firm' | 'apologetic' | 'assertive';
  relationship: 'colleague' | 'manager' | 'report' | 'client' | 'vendor' | 'stranger';
  goal: 'resolve' | 'apology' | 'urgent' | 'boundary' | 'escalate';
  alternatives: number;
  length: number;
  context: string;
  senderName: string;
  preserveDemands: boolean;
  language: string;
}

// ── AI Provider ──────────────────────────────────────

export interface AIProvider {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  apiKeyEnv: string;
  maxRetries: number;
  timeout: number;
  freeLimit: string;
  formatRequest: (prompt: string, systemPrompt: string) => {
    url: string;
    headers: Record<string, string>;
    body: string;
  };
  parseResponse: (response: unknown) => string;
}

export interface AIExecutionResult {
  result: string;
  provider: string;
  deductCredits: boolean;
  processingTimeMs: number;
}

// ── API Responses ────────────────────────────────────

export interface ToolResponse {
  result: Record<string, unknown>;
  creditsUsed: number;
  creditsRemaining: number;
  provider: string;
  historyId: string;
  processingTimeMs: number;
}

export interface ApiError {
  error: string;
  message: string;
  required?: number;
  current?: number;
}
