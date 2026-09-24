import { NextResponse } from "next/server"
import { hasKey } from "@/lib/env"

export async function POST(request: Request) {
  const body = await request.json()
  const accessToken = body.accessToken || process.env.META_PAGE_ACCESS_TOKEN
  const recipientId = String(body.recipientId || "")
  const message = String(body.message || "")

  if (!hasKey(accessToken) || !recipientId) {
    return NextResponse.json({ success: true, mode: "local", queued: true })
  }

  const res = await fetch(`https://graph.facebook.com/v21.0/me/messages?access_token=${accessToken}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text: message },
    }),
  })
  const data = await res.json()
  return NextResponse.json({ success: res.ok, data })
}
