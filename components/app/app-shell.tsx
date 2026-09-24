"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { X, ArrowRight } from "lucide-react"
import { SidebarContent } from "@/components/app/sidebar"
import { Topbar } from "@/components/app/topbar"
import { cn } from "@/lib/utils"
import { TAB_PATHS, pathToTab } from "@/lib/navigation"
import { useApp } from "@/lib/app-state"

interface AppShellProps {
  children: React.ReactNode
  activeTab?: string
  onSelectTab?: (tab: string) => void
}

export function AppShell({ children, activeTab, onSelectTab }: AppShellProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { setActiveTab } = useApp()
  const currentTab = activeTab || pathToTab(pathname)

  useEffect(() => {
    setActiveTab(currentTab)
  }, [currentTab, setActiveTab])

  const goToTab = (tab: string) => {
    setActiveTab(tab)
    onSelectTab?.(tab)
    router.push(TAB_PATHS[tab] || "/")
  }

  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) goToTab(customEvent.detail)
    }
    const handleEliteNav = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: string; path: string }>
      if (customEvent.detail?.path) router.push(customEvent.detail.path)
    }
    window.addEventListener("switch-tab", handleSwitchTab)
    window.addEventListener("elite-navigate", handleEliteNav)
    return () => {
      window.removeEventListener("switch-tab", handleSwitchTab)
      window.removeEventListener("elite-navigate", handleEliteNav)
    }
  }, [router])

  const isSubPage = pathname !== "/"

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }
    goToTab("dashboard")
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground rtl">
      <aside className="hidden w-64 shrink-0 border-l border-sidebar-border bg-sidebar md:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 right-0 w-72 border-l border-sidebar-border bg-sidebar transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute left-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setOpen(true)} onSelectTab={goToTab} />

        {isSubPage && (
          <div className="bg-card/50 border-b border-border px-4 py-2.5 sm:px-6 flex items-center justify-between backdrop-blur-sm">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-xs font-bold transition-all border border-primary/20"
            >
              <ArrowRight className="h-4 w-4" />
              <span>رجوع</span>
            </button>
            <button
              onClick={() => goToTab("dashboard")}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              نظرة عامة
            </button>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
