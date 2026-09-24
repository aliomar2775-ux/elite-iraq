import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

function normalizeSupabaseUrl(raw?: string | null) {
  if (!raw) return ""
  return raw.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "").trim()
}

export function isSupabaseConfigured() {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  return Boolean(url && key && !key.includes("your_") && url.includes("supabase.co"))
}

let browserClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (browserClient) return browserClient
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  browserClient = createBrowserClient(url, key)
  return browserClient
}

/** توافق مع الاستيرادات القديمة — قد يكون null إذا لم تُضبط المفاتيح */
export const supabase = typeof window === "undefined" ? (null as unknown as SupabaseClient) : (getSupabase() as SupabaseClient)
