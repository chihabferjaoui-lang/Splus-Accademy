import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { ConfigurationError } from "./http.ts";

export function createServiceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    throw new ConfigurationError("Supabase server credentials are not configured.");
  }
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
