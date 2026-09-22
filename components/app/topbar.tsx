"use client"

import { useState, useRef, useEffect } from "react"
import {
  Search,
  Bell,
  Menu,
  LogOut,
  Moon,
  Sun,
  Check,
  Trash2,
  Radio,
  ChevronDown,
  X,
  Building2,
  Store,
  MessageSquare,
  ShoppingBag,
} from "lucide-react"
import { useApp } from "@/lib/app-state"
import { useTranslation } from "@/lib/dictionary"

type NotificationItem = {
  id: string
  title: string
  time: string
  read: boolean
  type: "message" | "order" | "system"
  targetTab?: string
}

const initialNotifications: NotificationItem[] = [
  { id: "1", title: "رسالة جديدة من إنستغرام (@ali_iq)", time: "منذ دقيقتين", read: false, type: "message", targetTab: "chatbot" },
  { id: "2", title: "تم تسجيل طلب جديد #1084 بقيمة 45,000 د.ع", time: "منذ 15 دقيقة", read: false, type: "order", targetTab: "orders" },
  { id: "3", title: "تم تفعيل الرد التلقائي بنجاح لقناة إنستغرام", time: "منذ ساعة", read: true, type: "system", targetTab: "channels" },
]

export function Topbar({
  onMenu,
  onSelectTab,
}: {
  onMenu?: () => void
  onSelectTab?: (tab: string) => void
}) {
  const {
    merchant,
    logout,
    channels,
    theme,
    setTheme,
    language,
    orders = [],
    products = [],
    navigateTo: appNavigateTo,
    setActiveTab,
    globalSearchQuery,
    setGlobalSearchQuery,
  } = useApp()

  const { t } = useTranslation(language)
  const connectedCount = channels ? channels.filter((c) => c.connected).length : 0

  // حالات القوائم المنسدلة
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // المرجع لإغلاق القوائم عند النقر خارجها
  const dropdownRef = useRef<HTMLDivElement>(null)

  // حالة إظهار نافذة نتائج البحث العائمة
  const [showSearchResults, setShowSearchResults] = useState(false)

  // عداد الإشعارات غير المقروءة
  const unreadCount = notifications.filter((n) => !n.read).length

  // تبديل الثيم الداكن والنهاري
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light")

  // 🎯 دالة ملاحة مركزية موحدة
  const navigateTo = (tabName: string, searchFilter: string = "") => {
    if (appNavigateTo) {
      appNavigateTo(tabName, searchFilter)
    } else {
      setActiveTab(tabName)
      if (setGlobalSearchQuery) setGlobalSearchQuery(searchFilter)
    }

    if (onSelectTab) {
      onSelectTab(tabName)
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("switch-tab", { detail: tabName }))
      if (tabName === "products" && searchFilter) {
        window.dispatchEvent(new CustomEvent("filter-products", { detail: searchFilter }))
      }
      if (tabName === "orders" && searchFilter) {
        window.dispatchEvent(new CustomEvent("filter-orders", { detail: searchFilter }))
      }
    }

    setShowSearchResults(false)
    setShowNotifications(false)
    setShowProfileMenu(false)
    if (setGlobalSearchQuery) setGlobalSearchQuery("")
  }

  // عند اختيار منتج محدد من نتائج البحث
  const handleSelectProduct = (productName: string) => {
    navigateTo("products", productName)
  }

  // عند اختيار طلب أو عميل محدد من نتائج البحث
  const handleSelectOrder = (orderQuery: string) => {
    navigateTo("orders", orderQuery)
  }

  // التعامل مع النقر على إشعار معين
  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    )

    if (item.targetTab) {
      navigateTo(item.targetTab)
    }
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const activeQuery = globalSearchQuery || ""

  // فلترة نتائج البحث الحية
  const filteredProducts = activeQuery.trim() && Array.isArray(products)
    ? products.filter((p) => p?.name?.toLowerCase().includes(activeQuery.toLowerCase()))
    : []

  const filteredOrders = activeQuery.trim() && Array.isArray(orders)
    ? orders.filter((o: any) => {
        const q = activeQuery.toLowerCase()
        const id = (o?.id || "").toLowerCase()
        const name = (o?.customerName || o?.customer || "").toLowerCase()
        const phone = o?.phone || ""
        return id.includes(q) || name.includes(q) || phone.includes(q)
      })
    : []

  // إغلاق القوائم عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
        setShowProfileMenu(false)
        setShowSearchResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border bg-background/90 px-4 sm:px-6 backdrop-blur-md rtl" ref={dropdownRef}>
      {/* زر القائمة للشاشات الصغيرة */}
      <button
        onClick={onMenu}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground md:hidden"
        aria-label="فتح القائمة"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* 1. حقل البحث الحي المركزي */}
      <div className="relative hidden max-w-md flex-1 sm:block">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={activeQuery}
            onChange={(e) => {
              const val = e.target.value
              if (setGlobalSearchQuery) setGlobalSearchQuery(val)
              setShowSearchResults(val.trim().length > 0)
            }}
            onFocus={() => {
              if (activeQuery.trim().length > 0) setShowSearchResults(true)
            }}
            placeholder={t("searchPlaceholder") || "ابحث عن منتج، طلب، أو عميل..."}
            className="h-9 w-full rounded-xl border border-border bg-muted/40 pr-9 pl-8 text-xs outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
          />
          {activeQuery && (
            <button
              onClick={() => {
                if (setGlobalSearchQuery) setGlobalSearchQuery("")
                setShowSearchResults(false)
              }}
              className="absolute left-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* نتائج البحث المباشرة */}
        {showSearchResults && activeQuery.trim().length > 0 && (
          <div className="absolute top-11 right-0 left-0 z-50 max-h-80 overflow-y-auto rounded-2xl border border-border bg-card p-3 shadow-2xl text-right">
            {filteredProducts.length === 0 && filteredOrders.length === 0 ? (
              <p className="p-4 text-center text-xs text-muted-foreground">لا توجد نتائج مطابقة لبحثك.</p>
            ) : (
              <div className="space-y-3">
                {filteredProducts.length > 0 && (
                  <div>
                    <p className="mb-1 text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                      <ShoppingBag className="h-3.5 w-3.5 text-primary" /> المنتجات المطابقة:
                    </p>
                    <div className="space-y-1">
                      {filteredProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectProduct(p.name)}
                          className="flex items-center justify-between rounded-lg p-2.5 hover:bg-primary/10 transition-colors cursor-pointer text-xs border border-transparent hover:border-primary/20"
                        >
                          <span className="font-semibold text-foreground">{p.name}</span>
                          <span className="text-primary font-mono">{p.price?.toLocaleString("ar-IQ")} د.ع</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredOrders.length > 0 && (
                  <div>
                    <p className="mb-1 text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-500" /> الطلبات والعملاء:
                    </p>
                    <div className="space-y-1">
                      {filteredOrders.map((o: any) => {
                        const orderTotal = o.totalAmount || o.amount || o.total || 0;
                        const amountStr = typeof orderTotal === "number" ? `${orderTotal.toLocaleString("ar-IQ")} د.ع` : orderTotal;
                        const targetVal = o.id || o.customerName || o.customer || "";
                        return (
                          <div
                            key={o.id}
                            onClick={() => handleSelectOrder(targetVal)}
                            className="flex items-center justify-between rounded-lg p-2.5 hover:bg-emerald-500/10 transition-colors cursor-pointer text-xs border border-transparent hover:border-emerald-500/20"
                          >
                            <div>
                              <p className="font-bold">{o.customerName || o.customer || "زبون"} ({o.id})</p>
                              <p className="text-[10px] text-muted-foreground">{o.phone || ""} {o.governorate ? `· ${o.governorate}` : ""}</p>
                            </div>
                            <span className="text-xs font-bold text-emerald-500">{amountStr}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. أزرار التحكم والخدمات */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* زر القنوات المربوطة */}
        <button
          onClick={() => navigateTo("channels")}
          className="hidden md:flex items-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs font-semibold hover:border-primary/40 hover:bg-muted/60 transition-all cursor-pointer"
          title="إدارة القنوات المربوطة"
        >
          <Radio className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span>{connectedCount} {t("connectedChannels") || "قنوات مربوطة"}</span>
        </button>

        {/* زر الإشعارات */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowProfileMenu(false)
              setShowSearchResults(false)
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-all focus:outline-none cursor-pointer"
            aria-label="الإشعارات"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground transition-all">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card p-3 shadow-2xl z-50 text-xs text-right">
              <div className="flex items-center justify-between border-b border-border pb-2.5 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs">الإشعارات والتنبيهات</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {unreadCount} غير مقروء
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:underline flex items-center gap-1 px-1.5 py-1 rounded cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">قراءة الكل</span>
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">لا توجد إشعارات حالياً</div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`group flex items-start justify-between gap-2 rounded-xl p-2.5 text-xs transition-colors cursor-pointer ${
                        item.read
                          ? "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                          : "bg-primary/10 font-bold text-foreground border-r-2 border-primary hover:bg-primary/15"
                      }`}
                    >
                      <div className="flex-1 space-y-1">
                        <p className="leading-snug">{item.title}</p>
                        <span className="text-[10px] text-muted-foreground block">{item.time}</span>
                      </div>
                      {!item.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* بروفايل التاجر والمعلومات */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu)
              setShowNotifications(false)
              setShowSearchResults(false)
            }}
            className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-1.5 pl-2.5 hover:bg-muted/60 transition-all text-right cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 font-bold text-primary text-xs">
              {(merchant?.storeName || "م").charAt(0)}
            </div>
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-xs font-bold text-foreground">{merchant?.storeName || "متجرك"}</p>
              <p className="text-[10px] text-muted-foreground">خطة {merchant?.plan || "النمو"}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {showProfileMenu && (
            <div className="absolute left-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-2xl z-50 text-xs space-y-1 text-right">
              <div className="p-2 border-b border-border mb-1">
                <p className="font-bold text-sm">{merchant?.storeName || "متجر لمسة"}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Tenant ID: ws_iq_8921</p>
              </div>

              <button
                onClick={() => navigateTo("billing")}
                className="flex w-full items-center gap-2 rounded-lg p-2.5 hover:bg-primary/10 hover:text-primary text-right transition-colors font-semibold cursor-pointer"
              >
                <Building2 className="h-4 w-4 text-primary" />
                <span>إدارة الاشتراك والتوكنات</span>
              </button>

              <button
                onClick={() => navigateTo("settings")}
                className="flex w-full items-center gap-2 rounded-lg p-2.5 hover:bg-emerald-500/10 hover:text-emerald-500 text-right transition-colors font-semibold cursor-pointer"
              >
                <Store className="h-4 w-4 text-emerald-500" />
                <span>إعدادات المتجر والعناوين</span>
              </button>

              <div className="border-t border-border pt-1 mt-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    logout()
                  }}
                  className="flex w-full items-center gap-2 rounded-lg p-2.5 hover:bg-destructive/15 text-destructive text-right font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* زر الخروج المباشر */}
        <button
          onClick={logout}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/30 hover:bg-destructive/15 hover:border-destructive/30 hover:text-destructive transition-all cursor-pointer"
          title="تسجيل الخروج"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}