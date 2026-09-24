import { NextResponse } from "next/server"
import { hasKey } from "@/lib/env"

export async function POST(request: Request) {
  const body = await request.json()
  if (!hasKey(process.env.TIKTOK_APP_SECRET) && !hasKey(body.accessToken)) {
    return NextResponse.json({ success: true, mode: "local", queued: true })
  }
  return NextResponse.json({ success: true, queued: true, platform: "tiktok" })
}
