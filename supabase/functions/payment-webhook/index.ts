import {
  corsHeaders,
  errorResponse,
  InputError,
  jsonResponse,
  readText,
} from "../_shared/http.ts";
import { createServiceClient } from "../_shared/service-client.ts";

async function verifySignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  const secret = Deno.env.get("PAYMENT_WEBHOOK_SECRET") ?? Deno.env.get("WEBHOOK_SECRET");
  if (!secret || !signatureHeader) return false;

  const normalized = signatureHeader.trim();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return normalized.replace(/^sha256=/i, "") === expected || normalized === expected;
}

Deno.serve(async (request) => {
  const cors = corsHeaders(request);
  if (request.method === "OPTIONS") {
    return new Response(null, { status: cors ? 204 : 403, headers: cors ?? undefined });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Use POST for this endpoint." }, 405, cors);
  }

  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature") ?? request.headers.get("X-Signature");
    const signed = await verifySignature(rawBody, signature);
    if (!signed) {
      return jsonResponse({ error: "Webhook signature is invalid." }, 401, cors);
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new InputError("Send a valid JSON webhook payload.");
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new InputError("Send a valid JSON webhook payload.");
    }

    const event = payload as Record<string, unknown>;
    const provider = readText(event, "provider", 64, false, 1) || "unknown";
    const providerEventId = readText(event, "providerEventId", 256, false, 1)
      || readText(event, "eventId", 256, false, 1)
      || crypto.randomUUID();
    const status = readText(event, "status", 32, false, 1) || "received";

    const supabase = createServiceClient();
    const { error: insertError } = await supabase.from("payment_webhook_events").upsert(
      {
        provider,
        provider_event_id: providerEventId,
        processed_at: new Date().toISOString(),
      },
      { onConflict: "provider,provider_event_id" },
    );
    if (insertError) throw insertError;

    return jsonResponse({ ok: true, provider, providerEventId, status }, 200, cors);
  } catch (error) {
    return errorResponse(error, cors);
  }
});
