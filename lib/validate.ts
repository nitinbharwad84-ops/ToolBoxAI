const MAX_INPUT_LENGTH = 100_000;
const MAX_TWEAK_KEYS = 20;

export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.slice(0, MAX_INPUT_LENGTH).trim();
}

export function validateTweaks(tweaks: unknown): Record<string, unknown> {
  if (!tweaks || typeof tweaks !== 'object' || Array.isArray(tweaks)) return {};
  const entries = Object.entries(tweaks as Record<string, unknown>);
  if (entries.length > MAX_TWEAK_KEYS) return {};

  const clean: Record<string, unknown> = {};
  for (const [key, value] of entries) {
    if (typeof key !== 'string' || key.length > 50) continue;
    if (typeof value === 'string') clean[key] = value.slice(0, 200);
    else if (typeof value === 'number') clean[key] = Math.min(Math.max(value, 0), 100);
    else if (typeof value === 'boolean') clean[key] = value;
    else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      clean[key] = validateTweaks(value);
    }
  }
  return clean;
}

export function validateFileBase64(base64: unknown): string | null {
  if (typeof base64 !== 'string') return null;
  if (base64.length > 35_000_000) return null; // ~25MB in base64
  return base64;
}

export function validateEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 50_000) return null;
  return trimmed;
}
