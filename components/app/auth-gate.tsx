"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useApp } from "@/lib/app-state"

const PUBLIC_PATHS = new Set(["/login", "/register", "/auth/callback"])

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, user, merchant } = useApp()
  const pathname = usePathname()
  const router = useRouter()
  const isPublic = PUBLIC_PATHS.has(pathname)

  useEffect(() => {
    if (!ready) return

    if (!user && !isPublic) {
      router.replace("/login")
      return
    }
    if (user && isPublic) {
      router.replace(merchant?.ready ? "/" : "/onboarding")
      return
    }
    if (user && !merchant?.ready && pathname !== "/onboarding") {
      router.replace("/onboarding")
    }
    if (user && merchant?.ready && pathname === "/onboarding") {
      router.replace("/")
    }
  }, [isPublic, merchant?.ready, pathname, ready, router, user])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        جارٍ تجهيز المنصة...
      </div>
    )
  }

  if (!user && !isPublic) return null
  if (user && isPublic) return null
  if (user && !merchant?.ready && pathname !== "/onboarding") return null

  return <>{children}</>
}
