// lib/payments/zaincash.ts

export interface ZainCashInitRequest {
  amount: number
  orderId: string
  merchantId?: string
  secretKey?: string
}

export async function initZainCashPayment(params: ZainCashInitRequest) {
  // جهّزت لك الهيكل؛ بمجرد وضع مفاتيح زين كاش سيتصل بالبوابة مباشرة
  console.log("Initiating ZainCash Payment for Order:", params.orderId, "Amount:", params.amount)

  try {
    // يستدعي API Route الداخلي عند توفر المفاتيح
    const response = await fetch("/api/payments/zaincash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error("Failed to initialize ZainCash payment")
    }

    return await response.json()
  } catch (error) {
    console.error("ZainCash Error:", error)
    return { success: false, error }
  }
}