import { NextResponse } from "next/server"
import { hasKey } from "@/lib/env"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const platform = String(body.platform || "whatsapp")
    const text = String(body.text || "").trim()
    const phone = String(body.customerPhone || "")
    const handle = String(body.customerHandle || "")

    if (!text) {
      return NextResponse.json({ success: false, error: "النص فارغ" }, { status: 400 })
    }

    if (platform === "whatsapp") {
      if (!hasKey(process.env.WHATSAPP_ACCESS_TOKEN) || !hasKey(process.env.WHATSAPP_PHONE_NUMBER_ID)) {
        return NextResponse.json({ success: true, queued: true, mode: "local", platform })
      }
      let to = phone.replace(/\D/g, "")
      if (to.startsWith("07")) to = "964" + to.slice(1)
      const res = await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text },
        }),
      })
      const data = await res.json()
      return NextResponse.json({ success: res.ok, platform, data })
    }

    if (platform === "instagram" || platform === "facebook") {
      if (!hasKey(process.env.META_PAGE_ACCESS_TOKEN)) {
        return NextResponse.json({ success: true, queued: true, mode: "local", platform })
      }
      const res = await fetch(`https://graph.facebook.com/v21.0/me/messages?access_token=${process.env.META_PAGE_ACCESS_TOKEN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { id: handle.replace(/^@/, "") },
          message: { text },
        }),
      })
      const data = await res.json()
      return NextResponse.json({ success: res.ok, platform, data })
    }

    if (platform === "tiktok") {
      if (!hasKey(process.env.TIKTOK_APP_SECRET)) {
        return NextResponse.json({ success: true, queued: true, mode: "local", platform })
      }
      return NextResponse.json({ success: true, queued: true, platform })
    }

    return NextResponse.json({ success: true, queued: true, mode: "local", platform })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "send failed"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
