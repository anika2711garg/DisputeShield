import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getEnv, isSupabaseConfigured } from "@/lib/env";

export function getServiceSupabase() {
  if (!isSupabaseConfigured()) return null;
  const env = getEnv();
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
