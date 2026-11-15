import {
  errorResponse,
  handlePublicRequest,
  jsonResponse,
  readEmail,
  readJson,
  readText,
  verifyTurnstile,
} from "../_shared/http.ts";
import { createServiceClient } from "../_shared/service-client.ts";

Deno.serve(async (request) => {
  const { cors, error } = await handlePublicRequest(request);
  if (error) return error;

  try {
    const body = await readJson(request);
    const captchaToken = readText(body, "captchaToken", 2048);
    if (!await verifyTurnstile(captchaToken)) {
      return jsonResponse({ error: "Complete the anti-spam check and try again." }, 400, cors);
    }
    if (body.consent !== true) {
      return jsonResponse({ error: "Newsletter consent is required." }, 400, cors);
    }

    const email = readEmail(body);
    const { error: insertError } = await createServiceClient()
      .from("newsletter_subscribers")
      .upsert(
        { email, consented_at: new Date().toISOString(), unsubscribed_at: null },
        { onConflict: "email" },
      );
    if (insertError) throw insertError;

    return jsonResponse({ ok: true }, 201, cors);
  } catch (caught) {
    return errorResponse(caught, cors);
  }
});
