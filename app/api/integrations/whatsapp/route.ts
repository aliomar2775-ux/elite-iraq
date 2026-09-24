import { NextResponse } from "next/server"
import { hasKey } from "@/lib/env"

export async function POST(request: Request) {
  const body = await request.json()
  const accessToken = body.accessToken || process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = body.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID
  const to = String(body.to || "")
  const message = String(body.message || "")

  if (!hasKey(accessToken) || !hasKey(phoneNumberId)) {
    return NextResponse.json({ success: true, mode: "local", queued: true })
  }

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    }),
  })
  const data = await res.json()
  return NextResponse.json({ success: res.ok, data })
}
