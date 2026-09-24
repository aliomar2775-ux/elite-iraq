export function hasKey(value?: string | null) {
  if (!value) return false
  const v = value.trim()
  if (!v) return false
  if (/^your[_-]/i.test(v)) return false
  if (v.includes("_here")) return false
  return true
}

export function integrationStatus() {
  return {
    gemini: hasKey(process.env.GEMINI_API_KEY),
    supabase: hasKey(process.env.NEXT_PUBLIC_SUPABASE_URL) && hasKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    meta: hasKey(process.env.NEXT_PUBLIC_META_APP_ID) && hasKey(process.env.META_PAGE_ACCESS_TOKEN),
    whatsapp: hasKey(process.env.WHATSAPP_PHONE_NUMBER_ID) && hasKey(process.env.WHATSAPP_ACCESS_TOKEN),
    tiktok: hasKey(process.env.TIKTOK_APP_ID) && hasKey(process.env.TIKTOK_APP_SECRET),
    telegram: hasKey(process.env.TELEGRAM_BOT_TOKEN) && hasKey(process.env.TELEGRAM_CHAT_ID),
    zaincash: hasKey(process.env.ZAINCASH_MERCHANT_ID) && hasKey(process.env.ZAINCASH_SECRET_KEY),
    mastercard: hasKey(process.env.MASTERCARD_MERCHANT_ID) && hasKey(process.env.MASTERCARD_API_PASSWORD),
  }
}
