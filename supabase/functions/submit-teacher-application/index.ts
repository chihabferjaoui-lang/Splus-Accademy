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

    const application = {
      full_name: readText(body, "fullName", 120, true, 2),
      email: readEmail(body),
      phone: readText(body, "phone", 32, true, 5),
      country: readText(body, "country", 100, true, 2),
      experience: readText(body, "experience", 3000, true, 2),
      certification: readText(body, "certification", 2000, true, 2),
      specialization: readText(body, "specialization", 1000, true, 2),
      availability: readText(body, "availability", 2000, true, 2),
      why_join: readText(body, "whyJoin", 3000, true, 2),
    };

    const { error: insertError } = await createServiceClient()
      .from("teacher_applications")
      .insert(application);
    if (insertError) throw insertError;

    return jsonResponse({ ok: true }, 201, cors);
  } catch (caught) {
    return errorResponse(caught, cors);
  }
});
