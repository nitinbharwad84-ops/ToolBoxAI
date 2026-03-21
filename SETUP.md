# ToolboxAI — Complete Environment & Supabase Setup Guide

> Step-by-step guide to get ToolboxAI running. Follow in order — each section corresponds to a group of `.env.local` variables.

---

## Prerequisites

- **Node.js** 18+ installed
- **npm** or **pnpm** package manager
- A **GitHub** account (for OAuth sign-in)
- Run `npm install` in the project root first

---

## 1. Clerk Authentication (4 variables)

Clerk handles all user authentication (sign-up, sign-in, OAuth).

### Step 1: Create a Clerk Account

1. Go to [clerk.com](https://clerk.com) and sign up (free tier available)
2. Click **"Create Application"**
3. Name it `ToolboxAI`
4. Select sign-in methods: **Email** + **Google** (recommended)
5. Click **Create**

### Step 2: Get API Keys

1. In your Clerk dashboard, go to **API Keys** (left sidebar)
2. Copy the two keys shown:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Set Up Webhook (for syncing users to Supabase)

1. In Clerk dashboard → **Webhooks** (left sidebar)
2. Click **"Add Endpoint"**
3. Set the URL to:
   - **Local dev:** Use [ngrok](https://ngrok.com) → `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - **Production:** `https://yourdomain.com/api/webhooks/clerk`
4. Select events: `user.created`, `user.updated`, `user.deleted`
5. Click **Create**
6. Copy the **Signing Secret** shown:

```env
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Route Configuration (no changes needed)

These are already set correctly in `.env.example`:

```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## 2. Supabase Database (3 variables)

Supabase provides the PostgreSQL database for users, history, billing, and presets.

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free tier: 2 projects)
2. Click **"New Project"**
3. Fill in:
   - **Name:** `toolboxai`
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users
4. Click **"Create Project"** — wait ~2 minutes for provisioning

### Step 2: Get Connection Keys

1. In your Supabase project dashboard, go to **Settings** → **API** (left sidebar under "Configuration")
2. Copy these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

| Key | Where to Find | Usage |
|-----|--------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL at top of API page | Client-side database access |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Under "Project API keys" → `anon` `public` | Client-side (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | Under "Project API keys" → `service_role` `secret` | Server-side (bypasses RLS) |

> ⚠️ **NEVER expose `SUPABASE_SERVICE_ROLE_KEY` on the client.** It has full database access.

### Step 3: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file `supabase/schema.sql` from this project
4. Copy **the entire file contents** and paste into the SQL Editor
5. Click **"Run"**
6. You should see success messages for all tables, functions, and indexes

This creates:

| Table | Purpose |
|-------|---------|
| `users` | User profiles, plan, credits, preferences |
| `tool_history` | All tool usage results |
| `credit_transactions` | Credit purchase/usage ledger |
| `tool_presets` | Saved tweak configurations per tool |
| `credit_packages` | Available credit packs with pricing |
| `subscription_plans` | Pro plan details and features |

Plus 2 database functions:
- `deduct_credits()` — Atomically deducts credits
- `add_credits()` — Atomically adds credits

### Step 4: Enable Row Level Security (RLS)

1. Go to **Authentication** → **Policies** in Supabase dashboard
2. For each table, enable RLS and add policies as needed
3. Since ToolboxAI uses the **service role key** on the server side, RLS is primarily for direct client access protection

### Step 5: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see all 6 tables listed
3. `credit_packages` should have 4 rows (Starter, Growth, Power, Team)
4. `subscription_plans` should have 1 row (Pro)

---

## 3. AI Providers (5 variables)

ToolboxAI uses multiple AI providers for smart routing. You need **at least one** key, but all five are recommended for full functionality.

### Variable 1: `GEMINI_API_KEY` (Google — Recommended, Free Tier)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click **"Create API Key"**
3. Select or create a Google Cloud project
4. Copy the key:

```env
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Free tier:** 60 requests/minute with Gemini 2.0 Flash

### Variable 2: `GROK_API_KEY` (xAI)

1. Go to [console.x.ai](https://console.x.ai)
2. Sign up and go to **API Keys**
3. Click **"Create API Key"**
4. Copy:

```env
GROK_API_KEY=xai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Free tier:** $25/month free credit available

### Variable 3: `GROQ_API_KEY` (Groq — Fast Inference)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up with Google/GitHub
3. Go to **API Keys** → **Create API Key**
4. Copy:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Free tier:** 30 requests/minute, generous daily limits

### Variable 4: `OPENROUTER_API_KEY` (Multi-Model Gateway)

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up → **Keys** (top right menu)
3. Click **"Create Key"**
4. Copy:

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
```

> **Free tier:** Free models available (check model list for `free` tag)

### Variable 5: `MISTRAL_API_KEY` (Mistral AI)

1. Go to [console.mistral.ai](https://console.mistral.ai)
2. Sign up → **API Keys**
3. Click **"Create new key"**
4. Copy:

```env
MISTRAL_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Free tier:** Available with rate limits

### Which Providers Are Required?

| Provider | Required? | Why |
|----------|----------|-----|
| **Gemini** | ✅ Highly recommended | Primary provider, best free tier |
| **Groq** | ✅ Recommended | Ultra-fast fallback |
| **Grok** | Optional | Additional routing option |
| **OpenRouter** | Optional | Access to many models |
| **Mistral** | Optional | European AI option |

> **Minimum:** Get at least `GEMINI_API_KEY` to start. The smart router will use whatever providers have valid keys.

---

## 4. User Key Encryption (1 variable)

This encrypts users' BYO (Bring Your Own) API keys stored in the database.

### Generate the Secret

Run this command in your terminal:

**Windows (PowerShell):**
```powershell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
```

**macOS/Linux:**
```bash
openssl rand -hex 32
```

Copy the 64-character hex string:

```env
API_KEY_ENCRYPTION_SECRET=a1b2c3d4e5f6...your64charhexstring
```

> ⚠️ **Critical:** If you lose or change this key, all stored user API keys become unreadable. Back it up securely.

---

## 5. Razorpay Payments (4 variables)

Razorpay handles credit pack purchases and Pro subscriptions (India-focused payments).

### Step 1: Create a Razorpay Account

1. Go to [razorpay.com](https://razorpay.com) and sign up
2. Complete KYC verification (required for live mode)
3. For development, use **Test Mode** (toggle at top of dashboard)

### Step 2: Get API Keys

1. In Razorpay dashboard → **Settings** → **API Keys**
2. Click **"Generate Test Key"** (for development)
3. Copy both:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

> **Note:** `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID` have the **same value**. The `NEXT_PUBLIC_` version is exposed to the browser for the checkout widget.

### Step 3: Set Up Webhook

1. In Razorpay dashboard → **Settings** → **Webhooks**
2. Click **"Add New Webhook"**
3. Set URL:
   - **Local dev:** `https://your-ngrok-url.ngrok.io/api/webhooks/razorpay`
   - **Production:** `https://yourdomain.com/api/webhooks/razorpay`
4. Select events:
   - `payment.captured`
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.cancelled`
   - `subscription.halted`
5. Copy the **Webhook Secret**:

```env
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

### For Testing Without Razorpay

If you don't need payments right now, you can leave these as placeholders. The app will work — billing pages will show but payments won't process.

---

## 6. App URL (1 variable)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

| Environment | Value |
|------------|-------|
| Local dev | `http://localhost:3000` |
| Production | `https://yourdomain.com` |

This is used for generating absolute URLs (SEO, Open Graph, webhooks).

---

## Final `.env.local` Template

After completing all steps above, your `.env.local` should look like:

```env
# ── CLERK ──────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key
CLERK_SECRET_KEY=sk_test_your_actual_key
CLERK_WEBHOOK_SECRET=whsec_your_actual_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# ── SUPABASE ────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your_service_role_key

# ── AI PROVIDERS ────────────────────────────────────────
GEMINI_API_KEY=AIzaSy...
GROK_API_KEY=xai-...
GROQ_API_KEY=gsk_...
OPENROUTER_API_KEY=sk-or-...
MISTRAL_API_KEY=...

# ── USER KEY ENCRYPTION ─────────────────────────────────
API_KEY_ENCRYPTION_SECRET=your_64_char_hex_string

# ── RAZORPAY ────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...

# ── APP ─────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Quick Start Checklist

| # | Step | Status |
|---|------|--------|
| 1 | `npm install` | ☐ |
| 2 | Create Clerk app → get 3 keys | ☐ |
| 3 | Create Supabase project → get 3 keys | ☐ |
| 4 | Run `supabase/schema.sql` in SQL Editor | ☐ |
| 5 | Get at least Gemini API key | ☐ |
| 6 | Generate encryption secret | ☐ |
| 7 | (Optional) Set up Razorpay test keys | ☐ |
| 8 | Set `NEXT_PUBLIC_APP_URL` | ☐ |
| 9 | Run `npm run dev` | ☐ |
| 10 | Visit `http://localhost:3000` | ☐ |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Invalid Clerk key" | Make sure you copied the full key including `pk_test_` prefix |
| Supabase "relation does not exist" | Run `schema.sql` again — tables weren't created |
| "429 Too Many Requests" from AI | You hit the free tier rate limit — wait 60s or add another provider |
| Webhook not firing | For local dev, you need ngrok. Clerk/Razorpay can't reach `localhost` |
| "Encryption error" on API keys | Your `API_KEY_ENCRYPTION_SECRET` was changed — re-enter user API keys |
| Build fails with "missing env" | Check every variable in `.env.local` has a value (not `placeholder`) |
