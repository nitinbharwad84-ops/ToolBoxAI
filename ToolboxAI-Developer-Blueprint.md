# ToolboxAI — Complete Developer Blueprint

---

## 1. Project Overview

**What it is:** A SaaS productivity platform with three AI-powered tools — a document summarizer, a resume analyzer, and an email tone transformer. Users get free credits on signup, can buy more, or subscribe to Pro for monthly credits and locked features.

**Who builds this:** A solo developer or small team comfortable with Next.js, REST APIs, and basic SQL. No specialized knowledge required beyond that.

**Estimated build time:** 3–5 weeks solo, 1–2 weeks with 2 developers.

---

## 2. Core Concepts to Understand Before Starting

Before writing a single line of code, the developer must understand how these four systems interact:

**Clerk → Supabase sync:** Clerk handles authentication entirely. Supabase stores all app data. They are separate systems. The bridge is a Clerk webhook — every time a user signs up, Clerk fires a POST request to your `/api/webhook/clerk` route. That route creates the user row in Supabase. If this webhook fails or is never set up, your app has auth but no user data. This is the most critical integration to get right first.

**Credits as currency:** Every tool use costs credits. Credits live in the `users.credits` column in Supabase. Deducting credits must be atomic — meaning it must happen in a single database transaction so two simultaneous requests can't both read the same balance and both succeed. This is handled by a Postgres function, not application code. Never deduct credits in JavaScript — always call the DB function.

**AI provider fallback:** There is no single AI API. There is a chain of providers. Your code tries them in order until one succeeds. If a provider returns a rate limit error (HTTP 429), skip it and try the next. The result always looks the same to the tool — a structured JSON object. The provider is an implementation detail.

**Razorpay payment → credit grant:** Razorpay handles the actual money movement. Your job is to verify the payment was real (using HMAC signature verification) and then add credits to the user. Never add credits based on a frontend callback alone — always verify on the server using the webhook or signature check.

---

## 3. Full Tech Stack with Justification

| Layer | Choice | Free tier? | Why this, not alternatives |
|---|---|---|---|
| Framework | Next.js 14 App Router | Yes (Vercel) | API routes + frontend in one repo, no separate backend needed |
| Language | TypeScript | Yes | Catch bugs at compile time, not runtime |
| Auth | Clerk | Yes (10k MAU) | Handles OAuth, email, sessions, webhooks — saves weeks |
| Database | Supabase | Yes (500MB) | Postgres with REST API, row-level security, webhooks built in |
| AI Layer | Multi-provider (see section 6) | Yes (free tiers) | No single point of failure, zero API cost |
| Payments | Razorpay | No | INR-native, popup checkout, good free dashboard |
| Styling | Tailwind CSS | Yes | Utility-first, no context switching |
| Hosting | Vercel | Yes (hobby) | Zero-config Next.js deployment |
| File parsing | pdf-parse + xlsx | Yes | Server-side PDF and Excel text extraction |

---

## 4. Repository Structure (Every File Explained)

```
toolboxai/
│
├── app/                              # Next.js App Router
│   │
│   ├── layout.tsx                    # Root layout — fonts, ClerkProvider, global CSS
│   ├── globals.css                   # Design tokens, CSS variables, base styles
│   ├── page.tsx                      # Landing page (public)
│   │
│   ├── sign-in/
│   │   └── page.tsx                  # Clerk <SignIn /> component, styled
│   ├── sign-up/
│   │   └── page.tsx                  # Clerk <SignUp /> component, styled
│   │
│   ├── dashboard/
│   │   ├── layout.tsx                # Sidebar, credit meter, mobile nav — wraps all dashboard pages
│   │   ├── page.tsx                  # Dashboard home — stats, recent activity, quick actions
│   │   ├── summarizer/
│   │   │   └── page.tsx              # Tool 1 — file upload, tweak panel, result display
│   │   ├── resume-roaster/
│   │   │   └── page.tsx              # Tool 2 — Pro gate, paste input, tweak panel, result
│   │   ├── email-pacifier/
│   │   │   └── page.tsx              # Tool 3 — textarea input, tweak panel, result
│   │   ├── history/
│   │   │   └── page.tsx              # All past results, filterable, exportable (Pro)
│   │   ├── billing/
│   │   │   └── page.tsx              # Credit packs, subscription plans, transaction history
│   │   └── settings/
│   │       └── page.tsx              # Profile, API key management, global preferences
│   │
│   └── api/                          # All API routes (server-side only)
│       ├── user/
│       │   └── route.ts              # GET (profile+credits), PATCH (preferences)
│       ├── user/
│       │   ├── api-key/
│       │   │   └── route.ts          # POST (save key), DELETE (remove key)
│       │   └── api-key/test/
│       │       └── route.ts          # GET — send test prompt, confirm key works
│       ├── tools/
│       │   ├── summarize/
│       │   │   └── route.ts          # POST — runs summarizer tool
│       │   ├── resume-roast/
│       │   │   └── route.ts          # POST — runs roaster (Pro check first)
│       │   └── email-pacify/
│       │       └── route.ts          # POST — runs pacifier
│       ├── history/
│       │   └── route.ts              # GET (list), DELETE (single item)
│       ├── history/
│       │   ├── [id]/
│       │   │   └── route.ts          # GET single result
│       │   └── export/
│       │       └── route.ts          # GET — returns CSV or JSON (Pro only)
│       ├── presets/
│       │   └── route.ts              # GET (list), POST (save) — Pro only
│       ├── presets/
│       │   └── [id]/
│       │       └── route.ts          # DELETE single preset
│       ├── razorpay/
│       │   ├── create-order/
│       │   │   └── route.ts          # POST — creates Razorpay order for credit pack
│       │   ├── verify-payment/
│       │   │   └── route.ts          # POST — verifies signature, grants credits
│       │   └── create-subscription/
│       │       └── route.ts          # POST — creates Razorpay subscription for Pro
│       └── webhook/
│           ├── clerk/
│           │   └── route.ts          # POST — Clerk user events → Supabase sync
│           └── razorpay/
│               └── route.ts          # POST — payment & subscription events
│
├── components/
│   ├── ui/                           # Generic reusable primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Slider.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Toggle.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Spinner.tsx
│   │   └── Tabs.tsx
│   │
│   ├── dashboard/
│   │   ├── Sidebar.tsx               # Nav links, credit meter, user info, plan badge
│   │   ├── CreditMeter.tsx           # Progress bar + balance + low-credit warning
│   │   ├── ProviderBadge.tsx         # Shows "Powered by Groq" if user enabled it
│   │   └── StatsCard.tsx             # Dashboard home metrics
│   │
│   ├── tools/
│   │   ├── TweakPanel.tsx            # Collapsible container, used by all 3 tools
│   │   ├── SliderInput.tsx           # Labeled slider with min/max/value display
│   │   ├── MultiToggle.tsx           # Button group for selecting one of N options
│   │   ├── CheckboxGroup.tsx         # Multiple checkboxes with select-all
│   │   ├── LiveCreditCost.tsx        # Real-time credit cost display
│   │   ├── FileDropzone.tsx          # Drag-and-drop upload, size validation
│   │   ├── PresetManager.tsx         # Save/load/delete presets (Pro only)
│   │   └── ResultCard/               # Per-tool result display components
│   │       ├── SummarizerResult.tsx
│   │       ├── ResumeRoasterResult.tsx
│   │       └── EmailPacifierResult.tsx
│   │
│   ├── billing/
│   │   ├── CreditPackCard.tsx        # Individual credit package display + buy button
│   │   ├── PlanCard.tsx              # Free/Pro plan comparison card
│   │   └── TransactionRow.tsx        # Single transaction in history list
│   │
│   └── landing/
│       ├── Navbar.tsx
│       ├── HeroSection.tsx
│       ├── ToolsSection.tsx
│       ├── HowItWorks.tsx
│       ├── PricingSection.tsx
│       ├── FAQSection.tsx
│       └── Footer.tsx
│
├── lib/                              # Pure logic, no React
│   ├── supabase.ts                   # Supabase client, DB helpers, TypeScript types
│   ├── ai-providers.ts               # Provider config + fallback chain executor
│   ├── prompt-builder.ts             # Builds final AI prompt from tweaks config
│   ├── credit-calculator.ts          # Calculates credit cost from tweaks
│   ├── razorpay.ts                   # Razorpay client + order/subscription helpers
│   ├── encryption.ts                 # AES-256 encrypt/decrypt for user API keys
│   └── utils.ts                      # Misc helpers (formatting, validation, etc.)
│
├── hooks/
│   ├── useUser.ts                    # Fetches /api/user, returns user data + credits
│   ├── useHistory.ts                 # Fetches /api/history with pagination
│   └── usePresets.ts                 # Fetches/manages presets for a tool
│
├── types/
│   └── index.ts                      # All shared TypeScript interfaces and types
│
├── supabase/
│   └── schema.sql                    # Full DB schema — run once in Supabase SQL editor
│
├── middleware.ts                     # Clerk auth protection for dashboard + API routes
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── .env.example                      # All required env vars documented
└── .env.local                        # Actual secrets — never commit this
```

---

## 5. Database Schema (Complete)

Run this entire file in Supabase SQL Editor once, in order.

### Table: `users`

```sql
CREATE TABLE users (
  id                        UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clerk_id                  TEXT UNIQUE NOT NULL,
  email                     TEXT NOT NULL,
  first_name                TEXT,
  last_name                 TEXT,
  image_url                 TEXT,

  -- Plan & credits
  plan                      TEXT NOT NULL DEFAULT 'free'
                              CHECK (plan IN ('free', 'pro')),
  credits                   INTEGER NOT NULL DEFAULT 100,
  total_credits_used        INTEGER NOT NULL DEFAULT 0,

  -- Razorpay
  razorpay_customer_id      TEXT UNIQUE,
  razorpay_subscription_id  TEXT,
  subscription_status       TEXT DEFAULT 'inactive'
                              CHECK (subscription_status IN
                                ('active','inactive','cancelled','halted')),
  subscription_period_end   TIMESTAMPTZ,

  -- User's own API key (stored encrypted)
  user_api_provider         TEXT,
  user_api_key_encrypted    TEXT,
  user_api_key_set_at       TIMESTAMPTZ,

  -- Global preferences
  default_language          TEXT DEFAULT 'English',
  show_provider_badge       BOOLEAN DEFAULT TRUE,
  auto_save_history         BOOLEAN DEFAULT TRUE,
  response_format           TEXT DEFAULT 'structured'
                              CHECK (response_format IN
                                ('structured','markdown','plain')),

  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `tool_history`

```sql
CREATE TABLE tool_history (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_id            TEXT NOT NULL,
  tool_name           TEXT NOT NULL
                        CHECK (tool_name IN
                          ('summarizer','resume_roaster','email_pacifier')),
  tool_display_name   TEXT NOT NULL,

  -- Content
  input_data          JSONB NOT NULL DEFAULT '{}',
  input_preview       TEXT,
  output_data         JSONB NOT NULL DEFAULT '{}',
  tweaks_used         JSONB NOT NULL DEFAULT '{}',

  -- Meta
  ai_provider_used    TEXT,
  credits_used        INTEGER NOT NULL DEFAULT 0,
  processing_time_ms  INTEGER,
  status              TEXT NOT NULL DEFAULT 'success'
                        CHECK (status IN ('success','failed','pending')),
  error_message       TEXT,

  -- File info (summarizer only)
  file_name           TEXT,
  file_size           INTEGER,
  file_type           TEXT,

  created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `credit_transactions`

```sql
CREATE TABLE credit_transactions (
  id                        UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_id                  TEXT NOT NULL,
  type                      TEXT NOT NULL
                              CHECK (type IN
                                ('purchase','subscription_grant','tool_use',
                                 'bonus','refund','initial_grant')),
  amount                    INTEGER NOT NULL,   -- positive = added, negative = deducted
  balance_after             INTEGER NOT NULL,
  description               TEXT NOT NULL,

  -- Razorpay references
  razorpay_order_id         TEXT,
  razorpay_payment_id       TEXT,
  razorpay_subscription_id  TEXT,

  -- Reference to the tool use if type = tool_use
  tool_history_id           UUID REFERENCES tool_history(id),

  created_at                TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `tool_presets`

```sql
CREATE TABLE tool_presets (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_id     TEXT NOT NULL,
  tool_name    TEXT NOT NULL
                 CHECK (tool_name IN
                   ('summarizer','resume_roaster','email_pacifier')),
  preset_name  TEXT NOT NULL,
  config       JSONB NOT NULL DEFAULT '{}',
  is_default   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Max 5 presets per user per tool (enforced in application layer)
```

### Table: `credit_packages`

```sql
CREATE TABLE credit_packages (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name             TEXT NOT NULL,
  credits          INTEGER NOT NULL,
  price_paise      INTEGER NOT NULL,   -- smallest INR unit (100 paise = ₹1)
  razorpay_plan_id TEXT,
  popular          BOOLEAN DEFAULT FALSE,
  description      TEXT,
  active           BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO credit_packages
  (name, credits, price_paise, popular, description) VALUES
  ('Starter',  100,   9900,   false, 'Try it out'),
  ('Growth',   500,   39900,  true,  'Best value'),
  ('Power',    1000,  69900,  false, 'For heavy users'),
  ('Team',     5000,  249900, false, 'Maximum value');
```

### Table: `subscription_plans`

```sql
CREATE TABLE subscription_plans (
  id                        UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name                      TEXT NOT NULL,
  plan_key                  TEXT UNIQUE NOT NULL,
  monthly_credits           INTEGER NOT NULL,
  price_monthly_paise       INTEGER NOT NULL,
  price_yearly_paise        INTEGER NOT NULL,
  razorpay_monthly_plan_id  TEXT,
  razorpay_yearly_plan_id   TEXT,
  features                  JSONB DEFAULT '[]',
  limits                    JSONB DEFAULT '{}',
  active                    BOOLEAN DEFAULT TRUE
);
```

### Required Postgres Functions

```sql
-- Deduct credits atomically (always call this, never UPDATE directly)
CREATE OR REPLACE FUNCTION deduct_credits(
  p_clerk_id TEXT,
  p_amount   INTEGER
) RETURNS TABLE(
  success           BOOLEAN,
  remaining_credits INTEGER,
  error_msg         TEXT
) AS $$
DECLARE v_user users%ROWTYPE;
BEGIN
  SELECT * INTO v_user
  FROM users WHERE clerk_id = p_clerk_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'User not found';
    RETURN;
  END IF;

  IF v_user.credits < p_amount THEN
    RETURN QUERY SELECT FALSE, v_user.credits, 'Insufficient credits';
    RETURN;
  END IF;

  UPDATE users SET
    credits = credits - p_amount,
    total_credits_used = total_credits_used + p_amount,
    updated_at = NOW()
  WHERE clerk_id = p_clerk_id;

  RETURN QUERY SELECT TRUE, (v_user.credits - p_amount), NULL::TEXT;
END;
$$ LANGUAGE plpgsql;


-- Add credits atomically
CREATE OR REPLACE FUNCTION add_credits(
  p_clerk_id TEXT,
  p_amount   INTEGER
) RETURNS TABLE(
  success     BOOLEAN,
  new_balance INTEGER
) AS $$
DECLARE v_balance INTEGER;
BEGIN
  UPDATE users
  SET credits = credits + p_amount, updated_at = NOW()
  WHERE clerk_id = p_clerk_id
  RETURNING credits INTO v_balance;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, v_balance;
END;
$$ LANGUAGE plpgsql;
```

### Indexes

```sql
CREATE INDEX idx_users_clerk_id           ON users(clerk_id);
CREATE INDEX idx_users_razorpay_customer  ON users(razorpay_customer_id);
CREATE INDEX idx_tool_history_clerk_id    ON tool_history(clerk_id);
CREATE INDEX idx_tool_history_created_at  ON tool_history(created_at DESC);
CREATE INDEX idx_credit_tx_clerk_id       ON credit_transactions(clerk_id);
CREATE INDEX idx_presets_user_tool        ON tool_presets(user_id, tool_name);
```

---

## 6. AI Provider System (Full Detail)

### Provider Configuration (`/lib/ai-providers.ts`)

Each provider is an object with the same interface:

```
{
  id             string    // internal identifier
  name           string    // display name
  baseUrl        string    // API endpoint
  model          string    // model name to use
  apiKey         string    // from environment variable
  maxRetries     number    // how many times to retry before skipping
  timeout        number    // ms before giving up on this provider
  freeLimit      string    // informational only
  formatRequest  function  // converts standard prompt → provider-specific body
  parseResponse  function  // converts provider response → standard string
}
```

This abstraction is important. All five providers use slightly different request/response formats. The `formatRequest` and `parseResponse` functions normalize them so the rest of the app never knows which provider ran.

### Provider Details

| Provider | Base URL | Model | Request format |
|---|---|---|---|
| Gemini | `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` | `gemini-2.0-flash` | Google's own format (not OpenAI-compatible) |
| Grok | `https://api.x.ai/v1/chat/completions` | `grok-3-mini` | OpenAI-compatible |
| Groq | `https://api.groq.com/openai/v1/chat/completions` | `llama-3.1-70b-versatile` | OpenAI-compatible |
| OpenRouter | `https://openrouter.ai/api/v1/chat/completions` | `meta-llama/llama-3.1-8b-instruct:free` | OpenAI-compatible + extra headers |
| Mistral | `https://api.mistral.ai/v1/chat/completions` | `mistral-small-latest` | OpenAI-compatible |

Gemini is the only non-standard one. All others use the OpenAI chat completions format with `{ messages: [{role, content}], model }`. For OpenRouter, also send `HTTP-Referer` and `X-Title` headers.

### Fallback Execution Logic

```
async function executeWithFallback(prompt, systemPrompt, userId):

  1. Fetch user from DB → check if user_api_key_encrypted is set

  2. If user has own key:
       decrypt key using AES-256
       try calling that provider
       if success → return { result, provider: 'user_key', deductCredits: false }
       if fail → log warning, continue to system providers
                 (unless user chose "only use my key" in settings)

  3. For each provider in [Gemini, Grok, Groq, OpenRouter, Mistral]:
       try:
         response = await callProvider(provider, prompt, systemPrompt)
         if response.ok:
           return { result: parseResponse(response), provider: provider.id, deductCredits: true }
       catch error:
         if error.status === 429: continue   (rate limited, try next)
         if error.status === 401: continue   (bad key, skip)
         if error.status === 503: continue   (service down)
         else: log error, continue           (unknown, skip)

  4. If all fail:
       throw new Error('SERVICE_UNAVAILABLE')
       → no credits deducted
       → user sees friendly error message
```

### Where to Get Free API Keys

| Provider | URL | Notes |
|---|---|---|
| Gemini | aistudio.google.com | Create API key — extremely generous free tier |
| Grok | console.x.ai | API section — free tier available |
| Groq | console.groq.com | Create API key — free, very fast inference |
| OpenRouter | openrouter.ai | Keys section — look for `:free` suffix on models |
| Mistral | console.mistral.ai | API Keys — free tier available |

---

## 7. Prompt Builder System (`/lib/prompt-builder.ts`)

Every tool has a `buildPrompt(content, tweaks)` function that returns `{ systemPrompt, userPrompt }`. The tweaks object is the direct output of whatever the user set in the TweakPanel.

### Summarizer — Variables Injected from Tweaks

- `tweaks.keyPoints` → "Provide exactly N key points"
- `tweaks.outputStyle` → "Format as bullet points" / "Write in paragraph prose" / "Explain like I'm 5"
- `tweaks.focusArea` → "Focus only on numbers and statistics" / "Focus on risks and warnings"
- `tweaks.depth` → 1–5 scale maps to "very brief" / "brief" / "standard" / "detailed" / "comprehensive"
- `tweaks.audience` → "Assume the reader is a C-suite executive" / "Assume the reader is a university student"
- `tweaks.language` → "Respond entirely in Hindi" (if not English)
- `tweaks.includeTldr` → adds/removes TLDR section from JSON schema
- `tweaks.includeActionItems` → adds/removes action_items from JSON schema
- `tweaks.includeSentiment` → adds/removes sentiment field
- `tweaks.includeStats` → adds/removes key_data_points field

All output is structured JSON. The JSON schema in the prompt adjusts based on which sections are enabled. Don't ask for fields you won't use.

### Resume Roaster — Variables Injected from Tweaks

- `tweaks.intensity` → 1 = "be encouraging and supportive", 5 = "be completely ruthless, spare nothing"
- `tweaks.targetRole` → "This person is applying for Senior Software Engineer roles at FAANG companies"
- `tweaks.experienceLevel` → "Evaluate as a mid-level candidate (3–6 years)"
- `tweaks.companyTarget` → Changes what benchmarks Marcus uses
- `tweaks.focusSections` → Only include analysis for checked sections in JSON output
- `tweaks.rewriteBullets` → If false, just flag problems without rewriting
- `tweaks.numFixes` → Controls length of `top_fixes` array in output
- `tweaks.persona` → Changes the system prompt persona entirely (Marcus / Career Coach / HR Manager)
- `tweaks.language` → Output language

### Email Pacifier — Variables Injected from Tweaks

- `tweaks.tone` → "Rewrite in a warm, empathetic tone that acknowledges feelings"
- `tweaks.relationship` → "The recipient is the sender's direct manager"
- `tweaks.goal` → "The primary goal is to firmly set a professional boundary"
- `tweaks.alternatives` → Number of alternative versions in output (1–3)
- `tweaks.length` → Short = remove filler, Detailed = full context preserved
- `tweaks.context` → Injected as "Additional context: ..." before the email
- `tweaks.senderName` → Added to signature section
- `tweaks.preserveDemands` → "The rewritten email must still clearly make the same request"
- `tweaks.language` → Output language

---

## 8. Credit Cost Calculator (`/lib/credit-calculator.ts`)

This function is called on the frontend (live preview) and backend (before deducting). The backend call is authoritative — never trust the cost sent from the frontend.

```
function calculateCreditCost(tool, tweaks):

  SUMMARIZER base = 10
    + (keyPoints === 3  ? -2 : 0)
    + (keyPoints === 7  ? +1 : 0)
    + (keyPoints === 10 ? +3 : 0)
    + (depth > 3        ? (depth - 3) * 1 : 0)
    + (language !== 'English' ? +2 : 0)
    → minimum cost = 5

  RESUME_ROASTER base = 15
    + (numFixes === 5   ? +2 : 0)
    + (numFixes === 10  ? +5 : 0)
    + (language !== 'English' ? +2 : 0)
    → minimum cost = 15

  EMAIL_PACIFIER base = 5
    + (alternatives === 2 ? +2 : 0)
    + (alternatives === 3 ? +4 : 0)
    + (length === 5       ? +1 : 0)
    + (language !== 'English' ? +2 : 0)
    → minimum cost = 5

  return finalCost
```

---

## 9. User API Key System

### Encryption (`/lib/encryption.ts`)

Use Node.js built-in `crypto` module. AES-256-GCM.

```
encrypt(plainText, secret):
  1. Generate random 16-byte IV
  2. Create cipher: AES-256-GCM, key = SHA-256 of secret env var
  3. Encrypt plainText
  4. Get auth tag (GCM provides integrity)
  5. Return base64 of: iv + authTag + cipherText (all concatenated)

decrypt(encryptedText, secret):
  1. Base64 decode
  2. Split back into iv (16 bytes) + authTag (16 bytes) + cipherText
  3. Create decipher with same key
  4. Set auth tag
  5. Decrypt and return plainText
```

The encryption secret is `API_KEY_ENCRYPTION_SECRET` in env vars — a random 32-character string. Generate it once with `openssl rand -hex 32` and never change it. Changing it will break all stored keys.

### Settings Page — API Key UI Flow

```
1. User visits Settings → "Your API Key" section

2. Shows current state:
   - No key set: empty input + provider dropdown + "Save" button
   - Key set: masked display (sk-ant-••••••••) + provider name + "Test" + "Remove"

3. User selects provider from dropdown, pastes key, clicks "Save":
   POST /api/user/api-key { provider, key }
   → server encrypts key → saves to DB → returns { success: true }
   → UI shows masked key + "Saved" confirmation

4. User clicks "Test":
   GET /api/user/api-key/test
   → server decrypts key → sends minimal test prompt to provider
   → returns { working: true/false, provider, latencyMs }
   → UI shows green checkmark or red warning

5. User clicks "Remove":
   DELETE /api/user/api-key
   → nulls out both user_api_provider and user_api_key_encrypted columns
   → returns to empty state

6. When user's key is active:
   Banner shown: "You're using your own API key — tool usage is FREE"
```

---

## 10. Tool Execution Flow (Step by Step)

This is the exact flow for every tool API route. All three tools follow the same pattern.

```
POST /api/tools/summarize

Step 1 — Auth
  Get clerkId from Clerk session (auth().userId)
  If not found → return 401

Step 2 — Load user
  SELECT * FROM users WHERE clerk_id = $clerkId
  If not found → return 404 (webhook may not have run yet)

Step 3 — Plan check (Resume Roaster only)
  If tool === 'resume_roaster' AND user.plan === 'free':
    return 403 { error: 'PRO_REQUIRED' }

Step 4 — Parse & validate input
  Extract content/file and tweaks from request body
  Validate: content not empty, file size within plan limit
  If file → extract text using pdf-parse or xlsx library

Step 5 — Calculate credit cost
  cost = calculateCreditCost(tool, tweaks)
  This runs on server — never trust client-sent cost

Step 6 — Check balance
  If user.credits < cost:
    return 402 { error: 'INSUFFICIENT_CREDITS', required: cost, current: user.credits }

Step 7 — Build prompt
  { systemPrompt, userPrompt } = buildPrompt(tool, content, tweaks)

Step 8 — Run AI with fallback
  { result, provider, deductCredits } = await executeWithFallback(
    userPrompt, systemPrompt, user.clerk_id
  )

Step 9 — Deduct credits (if not using own key)
  If deductCredits:
    { success, remaining, error } = await supabase.rpc('deduct_credits', {
      p_clerk_id: clerkId, p_amount: cost
    })
    If !success → return 402 (race condition protection)

Step 10 — Save to history (if auto_save enabled)
  INSERT INTO tool_history { ...all fields, tweaks_used: tweaks, ai_provider_used: provider }

Step 11 — Save credit transaction
  INSERT INTO credit_transactions {
    type: 'tool_use',
    amount: -cost,
    balance_after: remaining,
    description: 'Summarizer — 5 key points, English',
    tool_history_id: history.id
  }

Step 12 — Return response
  return 200 {
    result,             // structured JSON output
    creditsUsed: cost,
    creditsRemaining: remaining,
    provider,           // which AI provider ran
    historyId: history.id,
    processingTimeMs
  }
```

---

## 11. Razorpay Integration (Complete)

### Initial Setup (One-time in Razorpay Dashboard)

1. Create account at razorpay.com
2. Go to Settings → API Keys → Generate live/test keys
3. For subscriptions: Plans → Create Plan → set amount + interval → note the `plan_id`
4. Go to Webhooks → add your URL + select events (listed below)

### Required Webhook Events to Subscribe To

```
payment.captured           → one-time purchase confirmed
subscription.charged       → monthly Pro renewal
subscription.activated     → new Pro subscriber
subscription.cancelled     → user cancelled
subscription.halted        → payment failed (card declined, etc.)
```

### One-time Credit Purchase Flow

**Frontend:**
```
1. User clicks "Buy Growth Pack (500 credits)"
2. POST /api/razorpay/create-order { packageId: 'growth' }
3. Server returns: { orderId, amount, currency, keyId }
4. Frontend loads Razorpay JS SDK (script tag)
5. Open Razorpay popup:
   new Razorpay({
     key: keyId,
     order_id: orderId,
     amount: amount,
     currency: 'INR',
     name: 'ToolboxAI',
     description: 'Growth Pack — 500 credits',
     handler: function(response) {
       POST /api/razorpay/verify-payment {
         razorpay_order_id,
         razorpay_payment_id,
         razorpay_signature,
         packageId
       }
     }
   })
```

**Server — verify-payment route:**
```
1. Receive { order_id, payment_id, signature, packageId }
2. Verify signature:
   expectedSig = HMAC-SHA256(order_id + '|' + payment_id, RAZORPAY_KEY_SECRET)
   If expectedSig !== signature → return 400 (fraud attempt)
3. Look up package by packageId → get credits amount
4. Call add_credits(clerkId, credits)
5. INSERT credit_transaction { type: 'purchase', amount: +credits, razorpay_payment_id }
6. Return { success: true, newBalance }
```

### Pro Subscription Flow

**Creating subscription:**
```
POST /api/razorpay/create-subscription { billingCycle: 'monthly' | 'yearly' }

Server:
1. If user has no razorpay_customer_id:
   Create Razorpay customer via API → save ID to users table
2. Get plan_id from subscription_plans table (monthly or yearly)
3. Create Razorpay subscription:
   razorpay.subscriptions.create({
     plan_id,
     customer_notify: 1,
     total_count: 12,
     notes: { clerk_id: user.clerk_id }
   })
4. Return { subscriptionId, shortUrl }
```

**Webhook handler:**
```
POST /api/webhook/razorpay

1. Verify webhook signature:
   expectedSig = SHA-256(rawBody, RAZORPAY_WEBHOOK_SECRET)
   If mismatch → return 400

2. Parse event type:

   'subscription.activated':
     UPDATE users SET plan='pro', subscription_status='active',
       razorpay_subscription_id=$id,
       subscription_period_end = next_billing_date
     add_credits(clerkId, 1000)
     INSERT credit_transaction { type: 'subscription_grant', amount: +1000 }

   'subscription.charged':
     add_credits(clerkId, 1000)
     UPDATE users SET subscription_period_end = next_billing_date
     INSERT credit_transaction { type: 'subscription_grant', amount: +1000 }

   'subscription.cancelled':
     UPDATE users SET plan='free', subscription_status='cancelled'
     (keep remaining credits — they paid for them)

   'subscription.halted':
     UPDATE users SET subscription_status='halted'

3. Return 200 immediately — webhook must return fast
```

---

## 12. Clerk Webhook (`/api/webhook/clerk`)

```
POST /api/webhook/clerk

1. Verify webhook using svix library:
   const wh = new Webhook(CLERK_WEBHOOK_SECRET)
   const payload = wh.verify(rawBody, headers)

2. Handle event type:

   'user.created':
     INSERT INTO users {
       clerk_id, email, first_name, last_name, image_url,
       plan: 'free', credits: 100
     }
     INSERT INTO credit_transactions {
       type: 'initial_grant', amount: 100,
       description: 'Welcome — 100 free credits'
     }

   'user.updated':
     UPDATE users SET email, first_name, last_name, image_url
     WHERE clerk_id = $id

   'user.deleted':
     DELETE FROM users WHERE clerk_id = $id
     (CASCADE deletes history, transactions, presets)

3. Return 200
```

**Setup in Clerk Dashboard:** Webhooks → Add endpoint → URL: `https://yourdomain.com/api/webhook/clerk` → subscribe to `user.created`, `user.updated`, `user.deleted` → copy signing secret into `CLERK_WEBHOOK_SECRET`.

---

## 13. TweakPanel Component Architecture

```
<TweakPanel
  tool="summarizer"
  tweaks={tweaks}
  onChange={(newTweaks) => setTweaks(newTweaks)}
  creditCost={liveCost}
  defaultTweaks={DEFAULTS}
  presets={userPresets}
  onSavePreset={(name) => savePreset(name, tweaks)}
  onLoadPreset={(preset) => setTweaks(preset.config)}
/>
```

**Internal structure:**
```
TweakPanel
  ├── Header bar
  │     "⚙ Customize"  [live credit cost badge]  [Reset]  [▼ collapse]
  │
  └── Body (collapsible, hidden by default)
        ├── PresetBar (Pro only)
        │     [My Default] [For FAANG] [+ Save current]
        │
        ├── Tweak controls (vary by tool)
        │
        └── Footer
              "Credits for this run: 12"  [Reset to defaults]
```

**State management:** Tweaks live in `useState` in the tool page. TweakPanel receives them as props and calls `onChange` on every change. The live credit cost is derived from tweaks using `calculateCreditCost()` — no server call needed for this.

**Persistence:** Tweaks are NOT saved between sessions by default. They reset on page refresh. Only saved presets (Pro) persist permanently.

---

## 14. Default Tweaks Per Tool

```typescript
// Summarizer
const SUMMARIZER_DEFAULTS = {
  keyPoints: 5,
  outputStyle: 'bullet',        // bullet | numbered | prose | executive | eli5
  focusArea: 'entire',          // entire | decisions | data | actions | risks
  depth: 3,                     // 1-5 slider
  audience: 'general',          // general | executive | technical | student | legal
  language: 'English',
  includeTldr: true,
  includeActionItems: true,
  includeSentiment: false,
  includeStats: true,
}

// Resume Roaster
const ROASTER_DEFAULTS = {
  intensity: 3,                 // 1-5 slider (gentle to savage)
  targetRole: 'auto',           // auto | swe | pm | designer | marketing | finance | custom
  targetRoleCustom: '',
  experienceLevel: 'auto',      // auto | entry | mid | senior | executive
  companyTarget: 'any',         // any | faang | startup | consulting | govt
  focusSections: {
    summary: true,
    experience: true,
    skills: true,
    education: true,
    atsCheck: true,
    formatting: true,
  },
  rewriteBullets: true,
  numFixes: 3,                  // 3 | 5 | 10
  persona: 'marcus',            // marcus | coach | hr
  language: 'English',
}

// Email Pacifier
const PACIFIER_DEFAULTS = {
  tone: 'professional',         // professional | warm | firm | apologetic | assertive
  relationship: 'colleague',    // colleague | manager | report | client | vendor | stranger
  goal: 'resolve',              // resolve | apology | urgent | boundary | escalate
  alternatives: 1,              // 1 | 2 | 3
  length: 3,                    // 1-5 slider
  context: '',
  senderName: '',
  preserveDemands: true,
  language: 'English',
}
```

---

## 15. Tool Tweaks Reference

### Summarizer Tweaks

| Tweak | Options | Credit impact |
|---|---|---|
| Key points count | 3 / 5 / 7 / 10 | 3→−2cr, 7→+1cr, 10→+3cr |
| Output style | Bullet / Numbered / Prose / Executive Brief / ELI5 | none |
| Focus area | Entire doc / Decisions only / Data & numbers / Action items / Risks | none |
| Response depth | Short ←→ Detailed (slider 1–5) | +1cr per level above 3 |
| Target audience | General / Executive / Technical / Student / Legal | none |
| Output language | English / Hindi / Spanish / French / etc | +2cr if non-English |
| Include TLDR | Yes / No | none |
| Include action items | Yes / No | none |
| Include sentiment | Yes / No | none |
| Include key stats | Yes / No | none |

### Resume Roaster Tweaks

| Tweak | Options | Credit impact |
|---|---|---|
| Roast intensity | Gentle ←→ Savage (slider 1–5) | none |
| Target role | Auto-detect / SWE / PM / Designer / Marketing / Finance / Custom | none |
| Experience level | Auto-detect / Entry / Mid / Senior / Executive | none |
| Company target | Any / FAANG / Startups / Consulting / Govt | none |
| Focus sections | Summary ☑ Experience ☑ Skills ☑ Education ☑ ATS ☑ Formatting ☑ | none |
| Rewrite bullets | Yes (give rewrites) / No (flag only) | none |
| Number of priority fixes | 3 / 5 / 10 | 5→+2cr, 10→+5cr |
| Reviewer persona | Marcus (brutal) / Career Coach / HR Manager | none |
| Output language | English / Hindi / etc | +2cr if non-English |

### Email Pacifier Tweaks

| Tweak | Options | Credit impact |
|---|---|---|
| Output tone | Professional / Warm & empathetic / Firm but polite / Apologetic / Assertive | none |
| Relationship | Colleague / Manager / Direct report / Client / Vendor / Stranger | none |
| Email goal | Resolve issue / Get apology / Request urgent action / Set boundary / Escalate | none |
| Alternatives count | 1 / 2 / 3 versions | 2→+2cr, 3→+4cr |
| Email length | Short ←→ Detailed (slider) | +1cr if very detailed |
| Context field | Optional free text | none |
| Sender name/role | Optional | none |
| Preserve demands | Yes / No | none |
| Output language | English / Hindi / etc | +2cr if non-English |

---

## 16. Plans & Credits

| | Free | Pro ($12.99/mo or $9.99/mo yearly) |
|---|---|---|
| Starting credits | 100 (one-time) | 1,000/month |
| Summarizer | ✅ base 10 cr | ✅ base 10 cr |
| Email Pacifier | ✅ base 5 cr | ✅ base 5 cr |
| Resume Roaster | ❌ locked | ✅ base 15 cr |
| History retention | 7 days | Unlimited |
| File size limit | 5MB | 25MB |
| Saved presets | ❌ | ✅ 5 per tool |
| Export history | ❌ | ✅ CSV / JSON |
| Own API key | ✅ both plans | ✅ both plans |

### Credit Packs (One-time Purchase)

| Pack | Credits | Price |
|---|---|---|
| Starter | 100 | ₹99 |
| Growth | 500 | ₹399 |
| Power | 1,000 | ₹699 |
| Team | 5,000 | ₹2,499 |

---

## 17. Page-by-Page UI Specification

### Landing Page (`/`)
Sections in order: Navbar → Hero (headline + CTA + stats) → Tools overview (3 cards) → How it works (3 steps) → Pricing (Free vs Pro side by side) → FAQ (accordions) → Final CTA → Footer. Fully public, no auth required.

### Dashboard Home (`/dashboard`)
Shows: greeting with first name, current credits + plan badge, total uses this month, 3 quick-action cards (one per tool), recent history (last 5 items), low-credit warning banner if credits < 20.

### Tool Pages (all 3 follow same layout)
```
┌── Page header ──────────────────────────────────────┐
│  Tool name + description + credit cost badge         │
└──────────────────────────────────────────────────────┘

┌── Input area ───────────────────────────────────────┐
│  Summarizer:  file dropzone + OR paste text          │
│  Roaster:     large textarea                         │
│  Pacifier:    two textareas — email + context        │
└──────────────────────────────────────────────────────┘

┌── TweakPanel (collapsed by default) ───────────────┐
│  ⚙ Customize  [12 credits]  [Reset]  [▼]            │
└──────────────────────────────────────────────────────┘

[ Run Tool Button — shows spinner while loading ]

┌── Result area (hidden until result arrives) ────────┐
│  Structured result card (tool-specific)              │
│  Provider badge (if enabled)                         │
│  [ Copy ] [ Save ] [ Run again ]                     │
└──────────────────────────────────────────────────────┘
```

### History Page (`/dashboard/history`)
Table with columns: Tool, Preview, Credits used, Provider, Date. Filters: by tool, by date range. Clicking a row expands to show full result inline. Pro users see Export button (CSV/JSON). Free users see history from last 7 days only with upgrade prompt.

### Billing Page (`/dashboard/billing`)
Three sections: Current plan (usage bar + upgrade/manage button) → Credit packs (4 cards with buy buttons, Razorpay popup) → Transaction history (table of all credit_transactions).

### Settings Page (`/dashboard/settings`)
Three sections: Profile (name, email, avatar — Clerk managed) → Your API Key (provider dropdown, key input, test/save/remove) → Global Preferences (language, response format, show provider badge toggle, auto-save history toggle).

---

## 18. Error States (Every Case)

| Error | HTTP code | User-facing message |
|---|---|---|
| Not logged in | 401 | Redirect to /sign-in |
| Pro feature on free plan | 403 | "This tool requires Pro. Upgrade to unlock." + upgrade button |
| Insufficient credits | 402 | "You need X credits but have Y. Buy more or add your own API key." |
| File too large | 400 | "File exceeds Xmb limit. Upgrade to Pro for larger files." |
| File type not supported | 400 | "Only PDF and Excel files are supported." |
| All AI providers failed | 503 | "Our AI providers are temporarily unavailable. No credits were charged. Try again in a minute." |
| User own API key failed | 400 | "Your API key returned an error. Check it in Settings or remove it to use system credits." |
| Empty input | 400 | "Please paste your content or upload a file." |
| Payment failed | 400 | "Payment could not be verified. No credits were added. Contact support if charged." |
| Webhook failed (silent) | — | Log to console, retry via Razorpay dashboard |

---

## 19. API Routes Summary

```
GET   /api/user                         → profile, credits, plan
PATCH /api/user                         → update preferences
POST  /api/user/api-key                 → save encrypted user API key
DELETE /api/user/api-key                → remove user API key
GET   /api/user/api-key/test            → test if key works

POST  /api/tools/summarize              → { content, fileBase64?, tweaks }
POST  /api/tools/resume-roast           → { content, tweaks } — Pro gate
POST  /api/tools/email-pacify           → { email, tweaks }

GET   /api/history                      → ?tool=&limit=&offset=
GET   /api/history/[id]                 → single result
DELETE /api/history/[id]                → delete one result
GET   /api/history/export               → CSV or JSON (Pro only)

GET   /api/presets/[tool]               → list saved presets (Pro)
POST  /api/presets                      → save preset (Pro)
DELETE /api/presets/[id]                → delete preset (Pro)

POST  /api/razorpay/create-order        → { packageId }
POST  /api/razorpay/verify-payment      → { order_id, payment_id, signature }
POST  /api/razorpay/create-subscription → { planId, billingCycle }

POST  /api/webhook/clerk                → user created/updated/deleted
POST  /api/webhook/razorpay             → payment & subscription events
```

---

## 20. Environment Variables (Complete)

```bash
# ── CLERK ──────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# ── SUPABASE ────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # NEVER expose — server only

# ── AI PROVIDERS (all free tiers) ───────────────────────
GEMINI_API_KEY=AIza...
GROK_API_KEY=xai-...
GROQ_API_KEY=gsk_...
OPENROUTER_API_KEY=sk-or-...
MISTRAL_API_KEY=...

# ── USER KEY ENCRYPTION ─────────────────────────────────
API_KEY_ENCRYPTION_SECRET=                # openssl rand -hex 32

# ── RAZORPAY ────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...  # safe to expose

# ── APP ─────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 21. Common Mistakes to Avoid

**Never trust the client for credit costs.** Always recalculate on the server using the same `calculateCreditCost` function. A user could modify the request body to send `creditCost: 1`.

**Never add credits before verifying payment.** Always verify the Razorpay HMAC signature on the server before calling `add_credits`. The frontend `handler` callback can be faked.

**Never return the decrypted API key to the frontend.** The `/api/user` route should return `user_api_key_set: true/false` and `user_api_provider`, never the actual key.

**Never deduct credits with a plain UPDATE statement.** Always use the `deduct_credits` Postgres function. Two simultaneous requests can both read `credits: 15`, both deduct 10, and both succeed — leaving the user at 5 instead of -5. The row lock in the function prevents this.

**Don't use the Supabase anon client in API routes.** Always use the service role client on the server. The anon client respects Row Level Security and may block operations if RLS policies aren't configured.

**Don't skip webhook signature verification.** Anyone can POST to `/api/webhook/clerk` or `/api/webhook/razorpay`. Always verify the signature before processing. Skipping this means an attacker could create fake users or grant themselves free credits.

---

## 22. Recommended Build Order

| Step | Task | Why this order |
|---|---|---|
| 1 | Set up Next.js project with TypeScript + Tailwind | Foundation |
| 2 | Run schema.sql in Supabase | DB must exist before anything writes to it |
| 3 | Set up Clerk, configure redirect URLs, add middleware | Auth gate before any dashboard work |
| 4 | Build Clerk webhook → create user in Supabase | No user row = nothing works |
| 5 | Build `/api/user` GET route | All pages need to load user credits |
| 6 | Build AI provider fallback chain | Core engine — test with a raw prompt first |
| 7 | Build prompt builder + credit calculator | Both needed before any tool route |
| 8 | Build Email Pacifier — API route + page | Simplest tool (no file upload, no Pro gate) |
| 9 | Build dashboard layout with sidebar + credit meter | Do this once, all tools share it |
| 10 | Build Summarizer — file parsing + API route + page | Adds file handling complexity |
| 11 | Build Resume Roaster — API route + page + Pro gate | Adds plan check, reuses everything |
| 12 | Build TweakPanel and wire to all 3 tools | Do after tools work without tweaks |
| 13 | Build History page + export (Pro) | Read-only, straightforward after tools work |
| 14 | Build user API key — settings page + encryption | Isolated feature, do after core works |
| 15 | Razorpay credit pack purchase + verify-payment | Test with test keys extensively |
| 16 | Razorpay Pro subscription + webhook handler | More complex, build after one-time works |
| 17 | Build Billing page (full UI) | Wraps steps 15 + 16 |
| 18 | Build Preset system (Pro) | Polish feature |
| 19 | Build Landing page | Build last when features are solid |
| 20 | Testing, error states, mobile responsiveness | Always last |
