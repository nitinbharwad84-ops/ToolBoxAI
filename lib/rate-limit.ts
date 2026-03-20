const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, val] of rateLimitStore) {
    if (val.resetAt < now) rateLimitStore.delete(key);
  }
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const LIMITS: Record<string, RateLimitConfig> = {
  tool:    { maxRequests: 10, windowMs: 60_000 },
  auth:    { maxRequests: 5,  windowMs: 60_000 },
  payment: { maxRequests: 5,  windowMs: 60_000 },
  default: { maxRequests: 30, windowMs: 60_000 },
};

export function rateLimit(
  identifier: string,
  type: keyof typeof LIMITS = 'default'
): { allowed: boolean; remaining: number; resetIn: number } {
  cleanupExpired();

  const config = LIMITS[type] ?? LIMITS.default;
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  if (!existing || existing.resetAt < now) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  existing.count++;
  const remaining = Math.max(0, config.maxRequests - existing.count);
  const resetIn = existing.resetAt - now;

  if (existing.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn };
  }

  return { allowed: true, remaining, resetIn };
}

export function rateLimitResponse(resetIn: number) {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: `Rate limit exceeded. Try again in ${Math.ceil(resetIn / 1000)} seconds.`,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(resetIn / 1000)),
      },
    }
  );
}
