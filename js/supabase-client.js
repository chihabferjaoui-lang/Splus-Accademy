import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const config = window.SPLUS_SUPABASE_CONFIG || {};
export const backendConfigured = Boolean(config.url && config.publishableKey);
export const turnstileConfigured = Boolean(config.turnstileSiteKey);

let client;

export function getSupabaseClient() {
  if (!backendConfigured) {
    throw new Error("Student accounts are not configured yet. Please contact S+ Academy.");
  }

  if (!client) {
    client = createClient(config.url, config.publishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      }
    });
  }

  return client;
}

export async function getSignedInUser(supabase) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!sessionData.session) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function hasAdminRole(supabase, userId) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}
