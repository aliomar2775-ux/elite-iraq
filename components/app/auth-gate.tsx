"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useApp } from "@/lib/app-state"
import { Loader2 } from "lucide-react"

const PUBLIC_PATHS = new Set(["/login", "/register", "/auth/callback"])

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, user, merchant } = useApp()
  const pathname = usePathname()
  const router = useRouter()

  // تنظيف المسار من الفواصل المائلة الممتدة لضمان تطابق الفحص
  const cleanPathname = pathname.length > 1 && pathname.endsWith("/") 
    ? pathname.slice(0, -1) 
    : pathname

  const isPublic = PUBLIC_PATHS.has(cleanPathname)

  useEffect(() => {
    if (!ready) return

    // 1. زائر غير مسجل يحاول الوصول لصفحة محمية
    if (!user && !isPublic) {
      router.replace("/login")
      return
    }

    // 2. مستخدم مسجل يحاول الوصول لصفحة عامة (تسجيل الدخول / إنشاء حساب)
    if (user && isPublic) {
      router.replace(merchant?.ready ? "/" : "/onboarding")
      return
    }

    // 3. مستخدم مسجل لم يكمل تهيئة المتجر ويحاول تصفح اللوحة
    if (user && !merchant?.ready && cleanPathname !== "/onboarding") {
      router.replace("/onboarding")
      return
    }

    // 4. مستخدم أكمل التهيئة بالفعل ويحاول فتح صفحة Onboarding مجدداً
    if (user && merchant?.ready && cleanPathname === "/onboarding") {
      router.replace("/")
    }
  }, [cleanPathname, isPublic, merchant?.ready, ready, router, user])

  // شاشة الانتظار الاحترافية أثناء جلب الجلسة والتأكد من البيانات
  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-sm text-muted-foreground rtl">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="font-medium animate-pulse">جارٍ تحضير لوحة التحكم...</span>
      </div>
    )
  }

  // منع الرندر اللحظي (Render Guards) لتفادي الوميض قبل التوجيه
  if (!user && !isPublic) return null
  if (user && isPublic) return null
  if (user && !merchant?.ready && cleanPathname !== "/onboarding") return null
  if (user && merchant?.ready && cleanPathname === "/onboarding") return null

  return <>{children}</>
}