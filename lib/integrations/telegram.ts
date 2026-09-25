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

/**
 * دالة إرسال رسالة عامة عبر بوت تليجرام التاجر
 */
export async function sendTelegramMessage(
  config: TelegramConfig,
  message: string
) {
  if (!config?.botToken || !config?.chatId) {
    console.warn("لم يتم إرسال الإشعار: التاجر لم يقم بتكثيف إعدادات التليجرام الخاصة بمتجره.")
    return { success: false, error: "Missing merchant Telegram config" }
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
    console.error("خطأ في إرسال إشعار تليجرام التاجر:", error)
    return { success: false, error }
  }
}

/**
 * دالة تنسيق وإرسال طلب جديد إلى تليجرام التاجر المُنشيء للمتجر
 */
export async function sendTelegramOrderNotification(
  order: OrderNotificationPayload,
  merchantConfig: TelegramConfig
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

  return await sendTelegramMessage(merchantConfig, formattedMessage)
}