import { corsHeaders, errorResponse, jsonResponse } from "../_shared/http.ts";
import { createServiceClient } from "../_shared/service-client.ts";

function providerSecretFor(channel: string): string | undefined {
  return channel === "email"
    ? Deno.env.get("EMAIL_PROVIDER_SECRET")
    : Deno.env.get("WHATSAPP_PROVIDER_SECRET");
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
    const supabase = createServiceClient();
    const { data: notifications, error: notificationError } = await supabase
      .from("notifications")
      .select("id, channel, title, body, recipient_id, locale")
      .in("channel", ["email", "whatsapp"])
      .eq("delivery_status", "pending")
      .order("created_at", { ascending: true })
      .limit(25);
    if (notificationError) throw notificationError;

    const { data: reminders, error: reminderError } = await supabase
      .from("reminders")
      .select("id, invoice_id, customer_id, channel, reminder_kind, locale, attempt_count")
      .in("channel", ["email", "whatsapp"])
      .eq("delivery_status", "pending")
      .order("scheduled_at", { ascending: true })
      .limit(25);
    if (reminderError) throw reminderError;

    let processed = 0;

    for (const message of notifications ?? []) {
      const providerSecret = providerSecretFor(message.channel);
      const status = providerSecret ? "sent" : "failed";

      const { error: updateError } = await supabase
        .from("notifications")
        .update({
          delivery_status: status,
          sent_at: status === "sent" ? new Date().toISOString() : null,
        })
        .eq("id", message.id);

      if (updateError) throw updateError;
      processed += 1;
    }

    for (const reminder of reminders ?? []) {
      const { data: invoice } = await supabase
        .from("invoices")
        .select("id, status")
        .eq("id", reminder.invoice_id)
        .maybeSingle();

      if (invoice && ["paid", "cancelled", "refunded"].includes(invoice.status)) {
        const { error: skipError } = await supabase
          .from("reminders")
          .update({ delivery_status: "failed", last_error: "Invoice is no longer payable." })
          .eq("id", reminder.id);
        if (skipError) throw skipError;
        processed += 1;
        continue;
      }

      const providerSecret = providerSecretFor(reminder.channel);
      const nextStatus = providerSecret ? "sent" : "failed";
      const nextError = providerSecret ? null : "Missing delivery provider secret.";
      const { error: updateError } = await supabase
        .from("reminders")
        .update({
          delivery_status: nextStatus,
          sent_at: nextStatus === "sent" ? new Date().toISOString() : null,
          attempt_count: (reminder.attempt_count ?? 0) + 1,
          last_error: nextError,
        })
        .eq("id", reminder.id);

      if (updateError) throw updateError;
      processed += 1;
    }

    return jsonResponse({ ok: true, processed }, 200, cors);
  } catch (error) {
    return errorResponse(error, cors);
  }
});
