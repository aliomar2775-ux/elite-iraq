"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { X, ArrowRight, LayoutDashboard } from "lucide-react"
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

  // مزامنة حالة التبويب النشط مع مسار الصفحة الحالي
  useEffect(() => {
    setActiveTab(currentTab)
  }, [currentTab, setActiveTab])

  // دالة تنقل موحدة ومحميّة عبر useCallback
  const goToTab = useCallback(
    (tab: string) => {
      setActiveTab(tab)
      onSelectTab?.(tab)
      setOpen(false) // إغلاق قائمة الجوال تلقائياً عند التنقل
      router.push(TAB_PATHS[tab] || "/")
    },
    [onSelectTab, router, setActiveTab]
  )

  // الاستماع المباشر لأحداث التنقل والتصفية من شريط البحث الموحد والـ Topbar
  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) goToTab(customEvent.detail)
    }

    const handleEliteNav = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: string; path: string }>
      if (customEvent.detail?.path) {
        setOpen(false)
        router.push(customEvent.detail.path)
      }
    }

    window.addEventListener("switch-tab", handleSwitchTab)
    window.addEventListener("elite-navigate", handleEliteNav)
    return () => {
      window.removeEventListener("switch-tab", handleSwitchTab)
      window.removeEventListener("elite-navigate", handleEliteNav)
    }
  }, [goToTab, router])

  const isSubPage = pathname !== "/"

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back()
      return
    }
    goToTab("dashboard")
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground rtl">
      {/* القائمة الجانبية للشاشات الكبيرة */}
      <aside className="hidden w-64 shrink-0 border-l border-sidebar-border bg-sidebar md:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* القائمة الجانبية المنزلقة للأجهزة المحمولة */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden transition-all duration-300",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 right-0 w-72 border-l border-sidebar-border bg-sidebar transition-transform duration-300 shadow-2xl",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute left-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </aside>
      </div>

      {/* منطقة المحتوى الرئيسية والشريط العلوي */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setOpen(true)} onSelectTab={goToTab} />

        {/* شريط الرجوع والتنقل السريع للصفحات الفرعية */}
        {isSubPage && (
          <div className="bg-card/40 border-b border-border/80 px-4 py-2.5 sm:px-6 flex items-center justify-between backdrop-blur-md">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-xs font-bold transition-all border border-primary/20 cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
              <span>رجوع</span>
            </button>
            <button
              onClick={() => goToTab("dashboard")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>الرئيسية</span>
            </button>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}