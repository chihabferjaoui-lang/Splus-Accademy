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
      preferred_schedule: readText(body, "preferredSchedule", 2000, true, 2),
      current_level: readText(body, "currentLevel", 64, false),
      learning_goals: readText(body, "learningGoals", 3000, false),
    };
    const programSlug = readText(body, "programSlug", 80);

    const supabase = createServiceClient();
    const { data: program, error: programError } = await supabase
      .from("programs")
      .select("id")
      .eq("slug", programSlug)
      .eq("active", true)
      .maybeSingle();
    if (programError) throw programError;
    if (!program) {
      return jsonResponse({ error: "Choose an available program." }, 400, cors);
    }

    const { data, error: insertError } = await supabase
      .from("student_applications")
      .insert({ ...application, program_id: program.id })
      .select("id")
      .single();
    if (insertError) throw insertError;

    return jsonResponse({ ok: true, applicationId: data.id }, 201, cors);
  } catch (caught) {
    return errorResponse(caught, cors);
  }
});
