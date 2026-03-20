# ToolboxAI

> AI-powered productivity SaaS — Summarize documents, roast resumes, transform emails.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)

## Features

- **3 AI Tools** — Summarizer, Resume Roaster (Pro), Email Pacifier
- **5 AI Providers** — Gemini, Grok, Groq, OpenRouter, Mistral with automatic failover
- **Credit System** — 100 free credits on signup, credit packs, Pro subscription
- **BYO API Key** — Use your own API key for unlimited free usage
- **TweakPanel** — Customize every tool run with real-time credit cost updates
- **Presets** — Save and load tool configurations (Pro)
- **History** — Search, filter, and export past results
- **Razorpay** — Credit packs + Pro subscription with webhook verification
- **Clerk Auth** — Sign in, sign up, webhooks, user management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (dark-mode SaaS) |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| Payments | Razorpay |
| AI | Gemini, Grok, Groq, OpenRouter, Mistral |

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in all values in .env.local

# 3. Set up database
# Run schema.sql in your Supabase SQL Editor

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GROK_API_KEY` | xAI Grok API key |
| `GROQ_API_KEY` | Groq API key |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `MISTRAL_API_KEY` | Mistral API key |
| `API_KEY_ENCRYPTION_SECRET` | 32-byte hex for AES-256-GCM (`openssl rand -hex 32`) |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay publishable key |
| `NEXT_PUBLIC_APP_URL` | App URL (e.g., `http://localhost:3000`) |

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout + SEO metadata
│   ├── page.tsx                # Landing page
│   ├── not-found.tsx           # Custom 404
│   ├── global-error.tsx        # Root error boundary
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard layout + Sidebar
│   │   ├── page.tsx            # Dashboard home
│   │   ├── summarizer/         # Summarizer tool page
│   │   ├── resume-roaster/     # Resume Roaster tool page (Pro)
│   │   ├── email-pacifier/     # Email Pacifier tool page
│   │   ├── history/            # Usage history
│   │   ├── billing/            # Plans & credit packs
│   │   ├── settings/           # API keys & preferences
│   │   ├── error.tsx           # Dashboard error boundary
│   │   └── loading.tsx         # Dashboard loading state
│   ├── api/
│   │   ├── tools/              # 3 tool API routes
│   │   ├── user/               # User profile + API key management
│   │   ├── history/            # History CRUD + export
│   │   ├── presets/            # Preset CRUD (Pro)
│   │   ├── razorpay/           # Payment creation + verification
│   │   └── webhook/            # Clerk + Razorpay webhooks
│   └── sign-in/, sign-up/      # Clerk auth pages
├── components/
│   ├── ui/                     # 12 reusable primitives
│   ├── dashboard/              # CreditMeter, StatsCard, Sidebar
│   ├── tools/                  # TweakPanel, FileDropzone, ResultCards
│   ├── billing/                # CreditPackCard, PlanCard, TransactionRow
│   ├── ErrorBoundary.tsx       # React error boundary
│   ├── ErrorState.tsx          # 5-type error display
│   ├── LoadingState.tsx        # Full/compact loading
│   └── EmptyState.tsx          # Empty state with action
├── hooks/                      # useUser, useHistory, usePresets
├── lib/                        # AI providers, credit calc, encryption, Supabase, utils
├── types/                      # TypeScript type definitions
└── proxy.ts                    # Clerk auth proxy (Next.js 16)
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/user` | User profile, credits, plan |
| `PATCH` | `/api/user` | Update preferences |
| `POST` | `/api/user/api-key` | Save encrypted API key |
| `DELETE` | `/api/user/api-key` | Remove API key |
| `GET` | `/api/user/api-key/test` | Test API key validity |
| `POST` | `/api/tools/summarize` | Summarizer tool |
| `POST` | `/api/tools/resume-roast` | Resume Roaster (Pro) |
| `POST` | `/api/tools/email-pacify` | Email Pacifier |
| `GET` | `/api/history` | List usage history |
| `GET` | `/api/history/export` | Export CSV/JSON (Pro) |
| `POST` | `/api/presets` | Save preset (Pro) |
| `POST` | `/api/razorpay/create-order` | Create credit pack order |
| `POST` | `/api/razorpay/verify-payment` | Verify payment |
| `POST` | `/api/webhook/clerk` | Clerk user events |
| `POST` | `/api/webhook/razorpay` | Payment events |

## Deployment

```bash
# Build
npm run build

# Deploy to Vercel
vercel deploy --prod
```

**Post-deployment checklist:**
1. Set all environment variables in Vercel dashboard
2. Configure Clerk webhook URL → `https://yourdomain.com/api/webhook/clerk`
3. Configure Razorpay webhook URL → `https://yourdomain.com/api/webhook/razorpay`
4. Run `schema.sql` in Supabase SQL Editor

## License

MIT
