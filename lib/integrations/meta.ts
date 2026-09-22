// lib/integrations/meta.ts (Instagram & Facebook Messenger)

export interface MetaConfig {
  pageAccessToken: string
  pageId?: string
  instagramAccountId?: string
}

// دالة إرسال رد أو إشعار عبر إنستغرام وفيسبوك مسنجر
export async function sendMetaMessage(
  config: MetaConfig,
  recipientId: string,
  message: string,
  platform: "instagram" | "facebook" = "instagram"
) {
  if (!config.pageAccessToken || !recipientId) {
    console.warn("Meta Page Access Token or Recipient ID is missing")
    return { success: false, error: "Missing Meta configuration" }
  }

  try {
    const response = await fetch(`/api/integrations/meta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken: config.pageAccessToken,
        recipientId,
        message,
        platform,
      }),
    })

    return await response.json()
  } catch (error) {
    console.error(`Meta (${platform}) Integration Error:`, error)
    return { success: false, error }
  }
}