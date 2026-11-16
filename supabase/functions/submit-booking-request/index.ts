import {
  errorResponse,
  handlePublicRequest,
  InputError,
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

    const fullName = readText(body, "fullName", 120, true, 2);
    const phone = readText(body, "phone", 32, true, 5);
    const programSlug = readText(body, "programSlug", 80);
    const requestedDate = readText(body, "requestedDate", 10);
    const requestedTime = readText(body, "requestedTime", 5);
    const requestedTimezone = readText(body, "requestedTimezone", 80);
    if (fullName.length < 2 || phone.length < 5
      || !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)
      || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(requestedTime)) {
      throw new InputError("Check your name, phone number, date, and time.");
    }

    const date = new Date(`${requestedDate}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== requestedDate
      || date.getTime() < new Date().setUTCHours(0, 0, 0, 0)) {
      throw new InputError("Choose a valid date from today onward.");
    }
    try {
      new Intl.DateTimeFormat("en", { timeZone: requestedTimezone });
    } catch {
      throw new InputError("Choose a valid time zone.");
    }

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
      .from("booking_requests")
      .insert({
        program_id: program.id,
        full_name: fullName,
        email: readEmail(body),
        phone,
        requested_date: requestedDate,
        requested_time: requestedTime,
        requested_timezone: requestedTimezone,
      })
      .select("reference")
      .single();
    if (insertError) throw insertError;

    return jsonResponse({ ok: true, reference: data.reference }, 201, cors);
  } catch (caught) {
    return errorResponse(caught, cors);
  }
});
