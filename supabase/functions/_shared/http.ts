export class InputError extends Error {}

export class ConfigurationError extends Error {}

export function corsHeaders(request: Request): Headers | null {
  const origin = request.headers.get("origin");
  const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!origin || !allowedOrigins.includes(origin)) return null;

  return new Headers({
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  });
}

export function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  cors: Headers | null,
): Response {
  const headers = new Headers(cors ?? undefined);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(JSON.stringify(body), { status, headers });
}

export function readText(
  data: Record<string, unknown>,
  name: string,
  maxLength: number,
  required = true,
): string {
  const value = data[name];
  if (typeof value !== "string") {
    if (!required && (value === undefined || value === null)) return "";
    throw new InputError(`Invalid ${name}.`);
  }
  const clean = value.trim();
  if ((required && clean.length === 0) || clean.length > maxLength) {
    throw new InputError(`Invalid ${name}.`);
  }
  return clean;
}

export function readEmail(data: Record<string, unknown>): string {
  const email = readText(data, "email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new InputError("Enter a valid email address.");
  }
  return email;
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    throw new InputError("Send a valid JSON request.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new InputError("Send a valid JSON request.");
  }
  return data as Record<string, unknown>;
}

export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  const expectedHostname = Deno.env.get("TURNSTILE_HOSTNAME");
  if (!secret || !expectedHostname) {
    throw new ConfigurationError("Anti-spam verification is not configured.");
  }

  const body = new URLSearchParams({ secret, response: token });
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`Turnstile verification failed with HTTP ${response.status}.`);

  const result: unknown = await response.json();
  if (!result || typeof result !== "object") return false;
  const verification = result as { success?: unknown; hostname?: unknown };
  return verification.success === true && verification.hostname === expectedHostname;
}

export async function handlePublicRequest(
  request: Request,
): Promise<{ cors: Headers | null; error: Response | null }> {
  const cors = corsHeaders(request);
  if (request.method === "OPTIONS") {
    return {
      cors,
      error: new Response(null, { status: cors ? 204 : 403, headers: cors ?? undefined }),
    };
  }
  if (!cors) {
    return {
      cors,
      error: jsonResponse({ error: "This request origin is not allowed." }, 403, null),
    };
  }
  if (request.method !== "POST") {
    return {
      cors,
      error: jsonResponse({ error: "Use POST for this endpoint." }, 405, cors),
    };
  }
  return { cors, error: null };
}

export function errorResponse(error: unknown, cors: Headers | null): Response {
  if (error instanceof InputError) {
    return jsonResponse({ error: error.message }, 400, cors);
  }
  if (error instanceof ConfigurationError) {
    console.error(error.message);
    return jsonResponse({ error: "This service is not configured yet." }, 503, cors);
  }
  console.error("Backend request failed.", error);
  return jsonResponse({ error: "Unable to process this request right now." }, 500, cors);
}
