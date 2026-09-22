// lib/integrations/whatsapp.ts

export interface WhatsAppConfig {
  phoneNumberId?: string
  accessToken?: string
  recipientPhone: string // رقم التاجر أو الزبون المصدر (مثال: 9647701230000)
}

// دالة إرسال رسالة واتساب عبر Meta Cloud API الرسمية
export async function sendWhatsAppMessage(config: WhatsAppConfig, message: string) {
  if (!config.recipientPhone) {
    console.warn("WhatsApp recipient phone number is missing")
    return { success: false, error: "Missing recipient phone" }
  }

  // تنظيف رقم الهاتف وتحويله للصيغة الدولية (العراق +964)
  let cleanPhone = config.recipientPhone.replace(/\D/g, "")
  if (cleanPhone.startsWith("07")) {
    cleanPhone = "964" + cleanPhone.substring(1)
  }

  try {
    // يستدعي API Route الداخلي عند وضع مفاتيح Meta API
    const response = await fetch("/api/integrations/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumberId: config.phoneNumberId,
        accessToken: config.accessToken,
        to: cleanPhone,
        message,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to send WhatsApp message")
    }

    return await response.json()
  } catch (error) {
    console.error("WhatsApp Integration Error:", error)
    return { success: false, error }
  }
}