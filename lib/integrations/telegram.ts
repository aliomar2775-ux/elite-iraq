// lib/integrations/telegram.ts

export interface TelegramConfig {
  botToken: string
  chatId: string
}

export async function sendTelegramMessage(config: TelegramConfig, message: string) {
  if (!config.botToken || !config.chatId) {
    console.warn("Telegram Bot Token or Chat ID is missing")
    return { success: false, error: "Missing config" }
  }

  try {
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
        parse_mode: "HTML",
      }),
    })

    const data = await response.json()
    return { success: data.ok, data }
  } catch (error) {
    console.error("Error sending Telegram notification:", error)
    return { success: false, error }
  }
}