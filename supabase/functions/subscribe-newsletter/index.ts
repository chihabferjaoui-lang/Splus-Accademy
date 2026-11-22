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
    const service = createServiceClient();
    const now = new Date().toISOString();
    const { error: insertError } = await service
      .from("newsletter_subscribers")
      .upsert(
        { email, consented_at: now, unsubscribed_at: null },
        { onConflict: "email" },
      );
    if (insertError) throw insertError;

    // Notify every admin in-app so signups are visible in the workspace.
    try {
      const { data: admins, error: adminsError } = await service
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      if (adminsError) throw adminsError;
      if (admins && admins.length) {
        const { error: notificationError } = await service
          .from("notifications")
          .insert(admins.map((admin) => ({
            recipient_id: admin.user_id,
            channel: "in_app",
            delivery_status: "sent",
            locale: "en",
            title: "New newsletter subscriber",
            body: `${email} joined the academy newsletter.`,
            sent_at: now,
          })));
        if (notificationError) throw notificationError;
      }
    } catch (notificationError) {
      // The subscription is already saved; a missing notice must not fail the signup.
      console.error("Could not create admin newsletter notification:", notificationError);
    }

    return jsonResponse({ ok: true }, 201, cors);
  } catch (caught) {
    return errorResponse(caught, cors);
  }
});
