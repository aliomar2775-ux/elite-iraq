import { NextResponse } from "next/server"
import { hasKey } from "@/lib/env"

export async function POST(request: Request) {
  const body = await request.json()
  const merchantId = body.merchantId || process.env.ZAINCASH_MERCHANT_ID
  const secretKey = body.secretKey || process.env.ZAINCASH_SECRET_KEY

  if (!hasKey(merchantId) || !hasKey(secretKey)) {
    return NextResponse.json({
      success: true,
      mode: "local",
      message: "تم تجهيز الدفع محلياً. أضف مفاتيح زين كاش لتفعيل البوابة.",
      orderId: body.orderId,
      amount: body.amount,
    })
  }

  return NextResponse.json({
    success: true,
    mode: "live",
    orderId: body.orderId,
    amount: body.amount,
    merchantId,
  })
}
