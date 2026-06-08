// Shared input validation helpers for edge functions.
// Keeps validation lightweight but enforces meaningful limits to
// prevent resource exhaustion, prompt injection bloat, and cost abuse.

export const MAX_FIELD_LEN = 2000;
export const MAX_LONG_FIELD_LEN = 20000;
export const MAX_BODY_BYTES = 100_000; // ~100KB JSON body cap

export class ValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function sanitizeString(value: unknown, maxLen = MAX_FIELD_LEN): string {
  if (value === null || value === undefined) return "";
  if (typeof value !== "string") {
    throw new ValidationError("Invalid input: expected string field");
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLen) {
    throw new ValidationError(`Input exceeds max length of ${maxLen}`);
  }
  // Strip control characters that have no business in user prompts.
  return trimmed.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

export async function readJsonBody(req: Request): Promise<Record<string, unknown>> {
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength && contentLength > MAX_BODY_BYTES) {
    throw new ValidationError("Request body too large");
  }
  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) {
    throw new ValidationError("Request body too large");
  }
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    throw new ValidationError("Invalid JSON body");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new ValidationError("Invalid JSON body: expected object");
  }
  return parsed as Record<string, unknown>;
}

export interface FieldRule {
  type?: "string" | "number" | "boolean" | "any";
  maxLen?: number;
  min?: number;
  max?: number;
  required?: boolean;
}

export function validateFields<T extends Record<string, FieldRule>>(
  body: Record<string, unknown>,
  schema: T,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, rule] of Object.entries(schema)) {
    const raw = body[key];
    if (raw === undefined || raw === null || raw === "") {
      if (rule.required) throw new ValidationError(`Missing required field: ${key}`);
      out[key] = raw ?? undefined;
      continue;
    }
    const type = rule.type ?? "string";
    if (type === "string") {
      out[key] = sanitizeString(raw, rule.maxLen ?? MAX_FIELD_LEN);
    } else if (type === "number") {
      const n = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isFinite(n)) throw new ValidationError(`Invalid number: ${key}`);
      if (rule.min !== undefined && n < rule.min) throw new ValidationError(`${key} below min`);
      if (rule.max !== undefined && n > rule.max) throw new ValidationError(`${key} above max`);
      out[key] = n;
    } else if (type === "boolean") {
      out[key] = Boolean(raw);
    } else {
      out[key] = raw;
    }
  }
  return out;
}

export function validationErrorResponse(error: unknown, corsHeaders: Record<string, string>): Response | null {
  if (error instanceof ValidationError) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return null;
}

// Recursively validates that all string fields in a body are within length limits.
// Caps strings at MAX_LONG_FIELD_LEN to defend against resource exhaustion / prompt injection bloat.
export function validateBodyStrings(value: unknown, depth = 0): void {
  if (depth > 6) throw new ValidationError("Input nesting too deep");
  if (value === null || value === undefined) return;
  if (typeof value === "string") {
    if (value.length > MAX_LONG_FIELD_LEN) {
      throw new ValidationError(`Input field exceeds max length of ${MAX_LONG_FIELD_LEN}`);
    }
    return;
  }
  if (Array.isArray(value)) {
    if (value.length > 500) throw new ValidationError("Array field too large");
    for (const v of value) validateBodyStrings(v, depth + 1);
    return;
  }
  if (typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) {
      validateBodyStrings(v, depth + 1);
    }
  }
}
