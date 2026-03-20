-- ToolboxAI — Complete Database Schema
-- Run this in Supabase SQL Editor (in order)

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Table: users ──────────────────────────────────────

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

-- ── Table: tool_history ───────────────────────────────

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

-- ── Table: credit_transactions ────────────────────────

CREATE TABLE credit_transactions (
  id                        UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_id                  TEXT NOT NULL,
  type                      TEXT NOT NULL
                              CHECK (type IN
                                ('purchase','subscription_grant','tool_use',
                                 'bonus','refund','initial_grant')),
  amount                    INTEGER NOT NULL,
  balance_after             INTEGER NOT NULL,
  description               TEXT NOT NULL,

  -- Razorpay references
  razorpay_order_id         TEXT,
  razorpay_payment_id       TEXT,
  razorpay_subscription_id  TEXT,

  -- Reference to the tool use
  tool_history_id           UUID REFERENCES tool_history(id),

  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ── Table: tool_presets ───────────────────────────────

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

-- ── Table: credit_packages ────────────────────────────

CREATE TABLE credit_packages (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name             TEXT NOT NULL,
  credits          INTEGER NOT NULL,
  price_paise      INTEGER NOT NULL,
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

-- ── Table: subscription_plans ─────────────────────────

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

INSERT INTO subscription_plans
  (name, plan_key, monthly_credits, price_monthly_paise, price_yearly_paise, features, limits) VALUES
  ('Pro', 'pro', 1000, 129900, 119900,
   '["Resume Roaster access", "Unlimited history", "25MB file uploads", "Save presets (5 per tool)", "Export history (CSV/JSON)", "1000 credits/month"]',
   '{"max_file_size_mb": 25, "history_retention_days": -1, "max_presets_per_tool": 5}');

-- ── Postgres Functions ────────────────────────────────

-- Deduct credits atomically
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
    RETURN QUERY SELECT FALSE, 0, 'User not found'::TEXT;
    RETURN;
  END IF;

  IF v_user.credits < p_amount THEN
    RETURN QUERY SELECT FALSE, v_user.credits, 'Insufficient credits'::TEXT;
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

-- ── Indexes ───────────────────────────────────────────

CREATE INDEX idx_users_clerk_id           ON users(clerk_id);
CREATE INDEX idx_users_razorpay_customer  ON users(razorpay_customer_id);
CREATE INDEX idx_tool_history_clerk_id    ON tool_history(clerk_id);
CREATE INDEX idx_tool_history_created_at  ON tool_history(created_at DESC);
CREATE INDEX idx_credit_tx_clerk_id       ON credit_transactions(clerk_id);
CREATE INDEX idx_presets_user_tool        ON tool_presets(user_id, tool_name);
