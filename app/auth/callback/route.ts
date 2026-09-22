import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // يتم تجاهل الخطأ عند استدعائه من مكونات السيرفر
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // توجيه التاجر حصراً إلى الصفحة الرئيسية للمنصة بعد اكتمال الجلسة بنجاح
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // في حال فشل التتمة يتم إرجاعه لصفحة الدخول مع رسالة خطأ واضحة
  return NextResponse.redirect(`${origin}/login?error=auth-failed`)
}