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

export async function checkAuthService() {
  if (!backendConfigured) {
    throw new Error("Student accounts are not configured yet. Please contact S+ Academy.");
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${config.url.replace(/\/$/, "")}/auth/v1/health`, {
      headers: { apikey: config.publishableKey },
      cache: "no-store",
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`The account service responded with HTTP ${response.status}.`);
    }
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The account service connection timed out. Please try again later.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
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
