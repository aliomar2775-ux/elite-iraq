import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // الرابط الدائم المعتمد على Vercel
  const BASE_URL = "https://bolt-project-access-pearl.vercel.app"
  const REDIRECT_URI = `${BASE_URL}/api/instagram`

  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    // في حالة إلغاء العملية أو رفض الصلاحيات من قبل المستخدم
    if (error || !code) {
      return NextResponse.redirect(`${BASE_URL}/channels?error=auth_denied`)
    }

    const INSTAGRAM_APP_ID = "2175512196365247"
    const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || "d6d0c8d3d2e48d869a5b1d9aedde4401"

    // 1. تبديل الـ Code المباشر من إنستغرام بـ Short-Lived Access Token
    const formData = new FormData()
    formData.append("client_id", INSTAGRAM_APP_ID)
    formData.append("client_secret", INSTAGRAM_APP_SECRET)
    formData.append("grant_type", "authorization_code")
    formData.append("redirect_uri", REDIRECT_URI)
    formData.append("code", code)

    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: formData,
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      console.error("❌ Instagram Token Error Details:", tokenData)
      throw new Error("فشل في الحصول على رمز الوصول من إنستغرام")
    }

    const shortLivedToken = tokenData.access_token
    const instagramUserId = tokenData.user_id

    // 2. تحويل الـ Token إلى Long-Lived Token (صالح لمدة 60 يوماً)
    let accessToken = shortLivedToken
    try {
      if (INSTAGRAM_APP_SECRET) {
        const longTokenResponse = await fetch(
          `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_APP_SECRET}&access_token=${shortLivedToken}`
        )
        const longTokenData = await longTokenResponse.json()
        if (longTokenData.access_token) {
          accessToken = longTokenData.access_token
        }
      }
    } catch (e) {
      console.warn("Could not fetch long-lived token, using short-lived fallback:", e)
    }

    // 3. جلب اسم حساب الإنستغرام للمتجر (@username)
    let igUsername = "@store.iq"
    try {
      const userResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
      )
      const userData = await userResponse.json()
      if (userData.username) {
        igUsername = `@${userData.username}`
      }
    } catch (e) {
      console.warn("Could not fetch username, using default handle:", e)
    }

    console.log("✅ [تم ربط إنستغرام بنجاح]:", {
      instagramUserId: instagramUserId,
      igUsername,
    })

    // 4. إعادة التوجيه للوحة القنوات بالرابط الدائم للموقع
    return NextResponse.redirect(
      `${BASE_URL}/channels?success=instagram_connected&handle=${encodeURIComponent(igUsername)}`
    )
  } catch (err: any) {
    console.error("Instagram Direct Auth Error:", err)
    return NextResponse.redirect(`${BASE_URL}/channels?error=server_error`)
  }
}