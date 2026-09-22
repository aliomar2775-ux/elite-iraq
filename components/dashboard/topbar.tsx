"use client"

import { Search, Bell, Menu, LogOut, Moon, Sun, Globe } from "lucide-react"
import { useApp } from "@/lib/app-state"

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  // هنا قمنا بسحب المتغيرات ودوال التعديل من العقل المركزي للموقع
  const { merchant, logout, channels, theme, setTheme, language, setLanguage, currency, setCurrency } = useApp()
  const connected = channels.filter((c) => c.connected).length

  // دوال التبديل تعتمد الآن على المركز الرئيسي
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light")
  const toggleLang = () => setLanguage(language === "ar" ? "en" : "ar")
  const toggleCurrency = () => setCurrency(currency === "IQD" ? "USD" : "IQD")

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <button
        onClick={onMenu}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground md:hidden"
        aria-label="فتح القائمة"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="ابحث عن منتج أو طلب أو عميل..."
          className="h-10 w-full rounded-lg border border-border bg-muted/40 pr-10 pl-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-background"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
        <span className="hidden rounded-lg border border-border px-2.5 py-1 text-[11px] text-muted-foreground md:inline">
          {connected} قنوات مربوطة
        </span>

        {/* زر العملة المتصل بالمركز */}
        <button
          onClick={toggleCurrency}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-[11px] font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          {currency}
        </button>

        {/* زر اللغة المتصل بالمركز */}
        <button
          onClick={toggleLang}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
        >
          <Globe className="h-[18px] w-[18px]" />
          <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
            {language === "ar" ? "ع" : "E"}
          </span>
        </button>

        {/* زر المظهر المتصل بالمركز */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
        >
          {theme === "dark" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
        </button>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
        </button>

        <div className="flex items-center gap-2.5 rounded-lg border border-border py-1 pr-1 pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-sm font-bold text-primary">
            {(merchant?.storeName || "م").charAt(0)}
          </div>
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-sm font-semibold">{merchant?.storeName || "متجرك"}</p>
            <p className="text-[11px] text-muted-foreground">خطة {merchant?.plan}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}