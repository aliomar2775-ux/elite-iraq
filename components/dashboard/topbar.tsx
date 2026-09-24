"use client"

import { Search, Bell, Menu, LogOut, Moon, Sun, Globe, X } from "lucide-react"
import { useApp } from "@/lib/app-state"

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  const {
    merchant,
    logout,
    channels = [],
    theme,
    setTheme,
    language,
    setLanguage,
    currency,
    setCurrency,
    globalSearchQuery,
    setGlobalSearchQuery,
  } = useApp()

  // حماية وقائية لمصفوفة القنوات المربوطة
  const connected = Array.isArray(channels)
    ? channels.filter((c) => c?.connected).length
    : 0

  // دوال التبديل المركزية
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")
  const toggleLang = () => setLanguage(language === "ar" ? "en" : "ar")
  const toggleCurrency = () => setCurrency(currency === "IQD" ? "USD" : "IQD")

  const searchQuery = globalSearchQuery || ""

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6 rtl text-foreground">
      {/* زر القائمة للشاشات الصغيرة */}
      <button
        onClick={onMenu}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted md:hidden cursor-pointer"
        aria-label="فتح القائمة"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* حقل البحث الحي المركزي */}
      <div className="relative hidden max-w-md flex-1 sm:block">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setGlobalSearchQuery && setGlobalSearchQuery(e.target.value)}
            placeholder="ابحث عن منتج، طلب، أو عميل..."
            className="h-10 w-full rounded-xl border border-border bg-muted/30 pr-9 pl-8 text-xs outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary text-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setGlobalSearchQuery && setGlobalSearchQuery("")}
              className="absolute left-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
              title="مسح البحث"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* أزرار التحكم والخدمات السريعة */}
      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
        <span className="hidden rounded-xl border border-border bg-muted/20 px-3 py-1.5 text-[11px] font-bold text-muted-foreground md:inline">
          {connected} قنوات مربوطة
        </span>

        {/* زر تبديل العملة */}
        <button
          onClick={toggleCurrency}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/30 text-xs font-bold font-mono text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground cursor-pointer"
          title="تغيير العملة"
        >
          {currency}
        </button>

        {/* زر تغيير اللغة */}
        <button
          onClick={toggleLang}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/30 text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground cursor-pointer"
          title="تغيير اللغة"
        >
          <Globe className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {language === "ar" ? "ع" : "E"}
          </span>
        </button>

        {/* زر تبديل الثيم */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/30 text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground cursor-pointer"
          title={theme === "dark" ? "الوضع النهاري" : "الوضع الداكن"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* زر الإشعارات */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/30 text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground cursor-pointer"
          title="الإشعارات"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
        </button>

        {/* بروفايل المتجر */}
        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/20 py-1 pr-1 pl-3 text-right">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-xs font-bold text-primary">
            {(merchant?.storeName || "م").charAt(0)}
          </div>
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-xs font-bold text-foreground">
              {merchant?.storeName || "متجرك"}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">
              خطة {merchant?.plan || "النمو"}
            </p>
          </div>
        </div>

        {/* زر الخروج */}
        <button
          onClick={logout}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/30 text-muted-foreground transition-all hover:bg-destructive/15 hover:border-destructive/30 hover:text-destructive cursor-pointer"
          title="تسجيل الخروج"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}