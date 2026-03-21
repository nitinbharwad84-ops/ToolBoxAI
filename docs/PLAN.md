# Phase 30: Implement Fake Payment System (Bypass Razorpay)

## The Goal

The user wants to remove the actual Razorpay checkout process and replace it with a "fake" payment system for testing/internal use. This means when a user clicks "Buy Credits" or "Subscribe", their account should instantly be updated without requiring real money or a credit card prompt.

## The Solution (Phase 2)
If approved, the agents will execute the following parallel fixes:

### 1. `backend-specialist`
*   Create new API endpoints for the fake payment system:
    *   `/api/payments/fake-buy/route.ts`: Simulates a credit pack purchase. It will find the package (50, 200, or 500), insert a `credit_transactions` log with `amount`, `type: 'purchased'`, and update the `users` table's `credits` integer.
    *   `/api/payments/fake-subscribe/route.ts`: Simulates a Pro subscription upgrade. It will update the `users` table setting `plan` to `'pro'`.
*   These endpoints will be secured by Clerk authentication (`auth()`).

### 2. `frontend-specialist`
*   Modify `app/dashboard/billing/page.tsx` directly.
*   Remove the Razorpay script loading logic or JS SDK initialization.
*   Update `handleBuyCredits`: Instead of creating a Razorpay order, it will POST to `/api/payments/fake-buy` and refresh the page or state upon success.
*   Update `handleSubscribe`: Instead of redirecting to a Razorpay short URL, it will POST to `/api/payments/fake-subscribe` and refresh the state.
*   Add a subtle UI indicator (e.g., toast or button text) like "Simulated Purchase Successful".

### 3. `database-architect` / `security-auditor`
*   Review the fake API handlers to ensure they correctly use Supabase transactions.
*   Ensure that the `credit_transactions` table gets the proper `balance_after` calculations during the fake purchase so the ledger remains mathematically sound, even without a vendor `payment_id`.

### 4. `test-engineer`
*   Run the unified linting and Next.js build verification to ensure no dead Razorpay imports crash the edge deployment.

---
**Do you approve this plan? (Y/N)**
Y