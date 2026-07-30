import { createBrowserClient } from "@supabase/ssr"
import { AUTH_BYPASS, createBypassSupabaseClient } from "@/lib/auth-bypass"

export function createClient() {
  if (AUTH_BYPASS) {
    return createBypassSupabaseClient() as ReturnType<typeof createBrowserClient>
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createBrowserClient(supabaseUrl, supabaseKey)
}
