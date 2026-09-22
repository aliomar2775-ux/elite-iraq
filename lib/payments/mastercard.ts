// lib/payments/mastercard.ts

export interface MastercardInitRequest {
  amount: number
  currency: string
  orderId: string
  customerName: string
}

export async function initMastercardPayment(params: MastercardInitRequest) {
  console.log("Initiating Mastercard Payment for Order:", params.orderId)

  try {
    const response = await fetch("/api/payments/mastercard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error("Failed to initialize Mastercard session")
    }

    return await response.json()
  } catch (error) {
    console.error("Mastercard Error:", error)
    return { success: false, error }
  }
}