import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  corsHeaders,
  errorResponse,
  jsonResponse,
  readEmail,
  readJson,
  readText,
} from "../_shared/http.ts";
import { createServiceClient } from "../_shared/service-client.ts";

function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim();
}

async function ensureAdmin(request: Request): Promise<{ supabase: any }> {
  const token = getBearerToken(request);
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!token || !url || !anonKey) {
    throw new Error("Authentication is not configured for this endpoint.");
  }

  const authenticated = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userError } = await authenticated.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Your session is not valid for this admin action.");
  }

  const serviceClient = createServiceClient();
  const { data: roles, error: rolesError } = await serviceClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id);

  if (rolesError) throw rolesError;
  if (!roles?.some((row: { role: string }) => row.role === "admin")) {
    throw new Error("Administrator access is required.");
  }

  return { supabase: serviceClient };
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
    const body = await readJson(request);
    const action = readText(body, "action", 32, true, 2).toLowerCase();
    const { supabase } = await ensureAdmin(request);

    if (action === "create-user") {
      const email = readEmail(body);
      const password = readText(body, "password", 128, true, 8);
      const fullName = readText(body, "fullName", 120, false, 2);
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName || email },
      });
      if (error) throw error;
      await supabase.from("user_roles").upsert(
        { user_id: data.user.id, role: "admin" },
        { onConflict: "user_id,role" },
      );
      return jsonResponse({ ok: true, user: { id: data.user.id, email: data.user.email } }, 200, cors);
    }

    if (action === "update-email") {
      const userId = readText(body, "userId", 64, true, 10);
      const email = readEmail(body);
      const { data, error } = await supabase.auth.admin.updateUserById(userId, { email });
      if (error) throw error;
      return jsonResponse({ ok: true, user: { id: data.user.id, email: data.user.email } }, 200, cors);
    }

    return jsonResponse({ error: "Unsupported admin action." }, 400, cors);
  } catch (error) {
    return errorResponse(error, cors);
  }
});
