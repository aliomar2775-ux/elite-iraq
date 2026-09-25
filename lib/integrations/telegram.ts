// lib/integrations/telegram.ts

export interface TelegramConfig {
  botToken: string
  chatId: string
}

export interface OrderNotificationPayload {
  id: string
  customerName: string
  phone: string
  address?: string
  governorate?: string
  items: string
  totalAmount: string | number
  status?: string
}

// القيم الافتراضية للبوت والشات الخاصين بك مع التوافق مع متغيرات البيئة
const DEFAULT_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ||
  "703073936:AAF_702bMK5my0zP_UfFDBUOxeB6TJKEKaI"

const DEFAULT_CHAT_ID =
  process.env.TELEGRAM_CHAT_ID ||
  process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID ||
  "224536870"

/**
 * دالة إرسال رسالة عامة عبر بوت التليجرام
 */
export async function sendTelegramMessage(
  config?: Partial<TelegramConfig>,
  message?: string
) {
  const botToken = config?.botToken || DEFAULT_BOT_TOKEN
  const chatId = config?.chatId || DEFAULT_CHAT_ID
  const textToSend = message || ""

  if (!botToken || !chatId) {
    console.warn("Telegram Bot Token or Chat ID is missing")
    return { success: false, error: "Missing config" }
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: textToSend,
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

/**
 * دالة مخصصة لتنسيق وإرسال إشعار طلب جديد تلقائياً
 */
export async function sendTelegramOrderNotification(
  order: OrderNotificationPayload,
  customConfig?: Partial<TelegramConfig>
) {
  const addressDetails = [order.governorate, order.address]
    .filter(Boolean)
    .join(" - ")

  const formattedMessage = `
<b>🛍️ طلب جديد تم تأكيده!</b>
----------------------------------
🆔 <b>رقم الطلب:</b> #${order.id}
👤 <b>اسم الزبون:</b> ${order.customerName}
📞 <b>رقم الهاتف:</b> <code>${order.phone}</code>
📍 <b>العنوان:</b> ${addressDetails || "غير محدد"}
📦 <b>المنتجات:</b> ${order.items}
💰 <b>المبلغ الكلي:</b> <b>${typeof order.totalAmount === "number" ? order.totalAmount.toLocaleString("ar-IQ") + " د.ع" : order.totalAmount}</b>
----------------------------------
⏰ <i>تاريخ الطلب: ${new Date().toLocaleString("ar-IQ")}</i>
`.trim()

  return await sendTelegramMessage(customConfig, formattedMessage)
}