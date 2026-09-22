// lib/integrations/tiktok.ts

export interface TikTokConfig {
  accessToken: string
  openId: string
}

// دالة إرسال رسالة مباشرة أو رد على رسائل تيك توك
export async function sendTikTokMessage(config: TikTokConfig, conversationId: string, message: string) {
  if (!config.accessToken) {
    console.warn("TikTok Access Token is missing")
    return { success: false, error: "Missing TikTok Access Token" }
  }

  try {
    const response = await fetch("/api/integrations/tiktok", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken: config.accessToken,
        conversationId,
        message,
      }),
    })

    return await response.json()
  } catch (error) {
    console.error("TikTok Integration Error:", error)
    return { success: false, error }
  }
}