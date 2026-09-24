"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  seedOrders,
  seedProducts,
  seedReplyRules,
  plans,
  type Channel,
  type Order,
  type OrderStatus,
  type Product,
  type ReplyRule,
} from "@/lib/data"
import { emptyAddress, type Address } from "@/lib/iraq"
import { TAB_PATHS } from "@/lib/navigation"

const STORAGE_KEY = "elite-iraq-app-v2"
const DEMO_EMAIL = "demo@elite.iq"
const DEMO_PASSWORD = "Elite123"
const LOCAL_OTP = "123456"

export type ChannelId = "instagram" | "tiktok" | "whatsapp" | "snapchat"

export type ConnectedChannel = {
  id: ChannelId
  name: Channel
  handle: string
  connected: boolean
  connectedAt?: string
}

export type SessionUser = {
  id: string
  name: string
  email: string
}

export type NotificationPrefs = {
  emailNewOrder: boolean
  soundNotification: boolean
  whatsappMerchantAlert: boolean
  highRiskAlert: boolean
}

export type TelegramSettings = {
  enabled: boolean
  botToken: string
  chatId: string
}

export type BusinessHours = {
  enabled: boolean
  startTime: string
  endTime: string
  offHoursMessage: string
}

export type AutoBackup = {
  enabled: boolean
  frequency: string
}

export type AntiSpam = {
  enabled: boolean
  blockedNumbers: string
  autoBlockHighReturns: boolean
}

export type Coupon = {
  id: string
  code: string
  percent: number
  active: boolean
  used: number
  maxUses: number
}

export type AppNotification = {
  id: string
  title: string
  time: string
  read: boolean
  type: "message" | "order" | "system" | "alert"
  href?: string
}

export type MerchantProfile = {
  storeName: string
  slug: string
  phone: string
  ownerName?: string
  contactEmail?: string
  storeAddressText?: string
  plan: string
  activePlanId: string
  aiModel: "gemini-2.5-flash" | "gemini-2.5-pro" | "gemini-1.5-flash" | "gemini-1.5-pro"
  aiTokensUsed: number
  aiTokenLimit: number
  address: Address
  ready: boolean
  notifications?: NotificationPrefs
  telegramSettings?: TelegramSettings
  businessHours?: BusinessHours
  autoBackup?: AutoBackup
  antiSpam?: AntiSpam
}

type PersistedUser = SessionUser & {
  password: string
  merchant: MerchantProfile
  channels: ConnectedChannel[]
  orders: Order[]
  products: Product[]
  rules: ReplyRule[]
  language?: string
  currency?: string
  theme?: string
  coupons?: Coupon[]
  notifications?: AppNotification[]
}

type AppState = {
  ready: boolean
  user: SessionUser | null
  merchant: MerchantProfile | null
  channels: ConnectedChannel[]
  orders: Order[]
  products: Product[]
  rules: ReplyRule[]
  language: string
  currency: string
  theme: string
  
  // 🚀 حالة التنقل والبحث المركزي المضافة
  activeTab: string
  setActiveTab: (tab: string) => void
  globalSearchQuery: string
  setGlobalSearchQuery: (query: string) => void
  navigateTo: (tab: string, searchQuery?: string) => void

  setLanguage: (lang: string) => void
  setCurrency: (curr: string) => void
  setTheme: (theme: string) => void
  coupons: Coupon[]
  notificationsInbox: AppNotification[]
  login: (email: string, password: string) => Promise<string | null>
  loginWithPhone: (phone: string, otp: string) => Promise<string | null>
  sendLocalOtp: (phone: string) => Promise<string | null>
  register: (name: string, email: string, password: string, extra?: { storeName?: string; phone?: string }) => Promise<string | null>
  logout: () => void
  completeOnboarding: (input: { storeName: string; slug: string; phone: string; address: Address }) => void
  updateMerchant: (patch: Partial<MerchantProfile>) => void
  upgradePlan: (planId: string) => void
  incrementAiUsage: (tokensCount?: number) => boolean
  connectChannel: (id: ChannelId, handle: string) => void
  disconnectChannel: (id: ChannelId) => void
  addOrder: (order: Omit<Order, "id" | "date">) => void
  updateOrderStatus: (id: string, status: OrderStatus) => void
  updateOrder: (updatedOrder: Order) => void
  deleteOrder: (id: string) => void
  addProduct: (product: Omit<Product, "id" | "sold" | "accent">) => void
  updateProduct: (updatedProduct: Product) => void
  deleteProduct: (id: string) => void
  addRule: (rule: Omit<ReplyRule, "id" | "hits">) => void
  toggleRule: (id: string) => void
  deleteRule: (id: string) => void
  incrementRuleHits: (id: string) => void
  addCoupon: (coupon: Omit<Coupon, "id" | "used">) => void
  toggleCoupon: (id: string) => void
  deleteCoupon: (id: string) => void
  applyCoupon: (code: string) => Coupon | null
  pushNotification: (item: Omit<AppNotification, "id" | "time" | "read">) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotifications: () => void
}

const CHANNEL_CATALOG: ConnectedChannel[] = [
  { id: "instagram", name: "إنستغرام", handle: "", connected: false },
  { id: "tiktok", name: "تيك توك", handle: "", connected: false },
  { id: "whatsapp", name: "واتساب", handle: "", connected: false },
  { id: "snapchat", name: "سناب شات", handle: "", connected: false },
]

const AppContext = createContext<AppState | null>(null)

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

function demoUser(): PersistedUser {
  const defaultPlan = plans[1] // Growth plan
  return {
    id: "user-demo",
    name: "مالك المتجر",
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    merchant: {
      storeName: "متجر لمسة",
      slug: "lamsa",
      phone: "07701230000",
      plan: defaultPlan.name,
      activePlanId: defaultPlan.id,
      aiModel: defaultPlan.aiModel,
      aiTokensUsed: 120000,
      aiTokenLimit: defaultPlan.monthlyTokenLimit,
      ready: true,
      address: {
        governorate: "بغداد",
        city: "الكرخ",
        district: "المنصور",
        street: "شارع الأميرات",
        details: "مجمع التجارة، الطابق الثاني",
      },
    },
    channels: CHANNEL_CATALOG.map((c) =>
      c.id === "instagram"
        ? { ...c, connected: true, handle: "@lamsa.iq", connectedAt: "١٢ سبتمبر ٢٠٢٦" }
        : c.id === "whatsapp"
          ? { ...c, connected: true, handle: "07701230000", connectedAt: "١٠ سبتمبر ٢٠٢٦" }
          : c
    ),
    orders: seedOrders,
    products: seedProducts,
    rules: seedReplyRules,
    language: "ar",
    currency: "IQD",
    theme: "dark",
    coupons: [
      { id: "c-welcome", code: "WELCOME10", percent: 10, active: true, used: 0, maxUses: 100 },
    ],
    notifications: [
      { id: "n1", title: "رسالة جديدة من إنستغرام (@ali_iq)", time: "منذ دقيقتين", read: false, type: "message", href: "/chatbot" },
      { id: "n2", title: "تم تسجيل طلب جديد من لوحة المتجر", time: "منذ 15 دقيقة", read: false, type: "order", href: "/orders" },
      { id: "n3", title: "تم تفعيل الرد التلقائي لقناة إنستغرام", time: "منذ ساعة", read: true, type: "system", href: "/channels" },
    ],
  }
}

function loadAll(): PersistedUser[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seeded = [demoUser()]
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: seeded, sessionId: null }))
      return seeded
    }
    const parsed = JSON.parse(raw) as { users: PersistedUser[] }
    return parsed.users ?? [demoUser()]
  } catch {
    return [demoUser()]
  }
}

function loadSessionId(): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return (JSON.parse(raw) as { sessionId?: string | null }).sessionId ?? null
  } catch {
    return null
  }
}

function persist(users: PersistedUser[], sessionId: string | null) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, sessionId }))
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<PersistedUser[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  // 🎯 حالة التنقل والبحث المركزية
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>("")

  const [language, setLanguageState] = useState<string>("ar")
  const [currency, setCurrencyState] = useState<string>("IQD")
  const [theme, setThemeState] = useState<string>("dark")

  useEffect(() => {
    setUsers(loadAll())
    setSessionId(loadSessionId())
    setReady(true)
  }, [])

  const current = users.find((u) => u.id === sessionId) ?? null

  useEffect(() => {
    const activeTheme = current?.theme ?? theme
    const root = document.documentElement
    const apply = (mode: string) => {
      if (mode === "dark") root.classList.add("dark")
      else root.classList.remove("dark")
    }
    if (activeTheme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      apply(mq.matches ? "dark" : "light")
      const listener = (e: MediaQueryListEvent) => apply(e.matches ? "dark" : "light")
      mq.addEventListener("change", listener)
      return () => mq.removeEventListener("change", listener)
    }
    apply(activeTheme)
  }, [current?.theme, theme])

  const commit = useCallback(
    (nextUsers: PersistedUser[], nextSession: string | null) => {
      setUsers(nextUsers)
      setSessionId(nextSession)
      persist(nextUsers, nextSession)
    },
    []
  )

  const patchCurrent = useCallback(
    (updater: (user: PersistedUser) => PersistedUser) => {
      if (!current) return
      commit(
        users.map((u) => (u.id === current.id ? updater(u) : u)),
        sessionId
      )
    },
    [commit, current, sessionId, users]
  )

  // 🎯 دالة التنقل المباشرة والموحدة
  const navigateTo = useCallback((tab: string, searchQuery: string = "") => {
    setActiveTab(tab)
    setGlobalSearchQuery(searchQuery)
    if (typeof window !== "undefined") {
      const path = TAB_PATHS[tab] || "/"
      if (window.location.pathname !== path) {
        window.dispatchEvent(new CustomEvent("elite-navigate", { detail: { tab, path, searchQuery } }))
      }
    }
  }, [])

  const setLanguage = useCallback(
    (lang: string) => {
      setLanguageState(lang)
      patchCurrent((u) => ({ ...u, language: lang }))
    },
    [patchCurrent]
  )

  const setCurrency = useCallback(
    (curr: string) => {
      setCurrencyState(curr)
      patchCurrent((u) => ({ ...u, currency: curr }))
    },
    [patchCurrent]
  )

  const setTheme = useCallback(
    (t: string) => {
      setThemeState(t)
      patchCurrent((u) => ({ ...u, theme: t }))
    },
    [patchCurrent]
  )

  const login = useCallback(
    async (email: string, password: string) => {
      const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
      if (!found || found.password !== password) return "البريد أو كلمة المرور غير صحيحة"
      commit(users, found.id)
      return null
    },
    [commit, users]
  )

  const register = useCallback(
    async (name: string, email: string, password: string, extra?: { storeName?: string; phone?: string }) => {
      const exists = users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())
      if (exists) return "هذا البريد مسجّل مسبقًا"
      const defaultPlan = plans[0]
      const user: PersistedUser = {
        id: uid("user"),
        name: name.trim() || extra?.storeName?.trim() || "تاجر جديد",
        email: email.trim().toLowerCase(),
        password,
        merchant: {
          storeName: extra?.storeName?.trim() || "",
          slug: (extra?.storeName || name || "store").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 24),
          phone: extra?.phone || "",
          ownerName: name.trim(),
          contactEmail: email.trim().toLowerCase(),
          plan: defaultPlan.name,
          activePlanId: defaultPlan.id,
          aiModel: defaultPlan.aiModel,
          aiTokensUsed: 0,
          aiTokenLimit: defaultPlan.monthlyTokenLimit,
          ready: false,
          address: emptyAddress(),
          notifications: {
            emailNewOrder: true,
            soundNotification: true,
            whatsappMerchantAlert: true,
            highRiskAlert: true,
          },
        },
        channels: CHANNEL_CATALOG.map((c) => ({ ...c })),
        orders: [],
        products: [],
        rules: seedReplyRules,
        language: "ar",
        currency: "IQD",
        theme: "dark",
        coupons: [{ id: uid("c"), code: "START10", percent: 10, active: true, used: 0, maxUses: 50 }],
        notifications: [
          {
            id: uid("n"),
            title: "مرحباً بك في إيليت العراق — أكمل إعداد المتجر وربط القنوات",
            time: "الآن",
            read: false,
            type: "system",
            href: "/onboarding",
          },
        ],
      }
      commit([...users, user], user.id)
      return null
    },
    [commit, users]
  )

  const sendLocalOtp = useCallback(async (phone: string) => {
    const clean = phone.replace(/\D/g, "")
    if (!/^(0)?(77|78|79|75)\d{8}$/.test(clean)) return "يرجى كتابة رقم هاتف عراقي صحيح"
    if (typeof window !== "undefined") {
      sessionStorage.setItem("elite-otp-phone", clean)
      sessionStorage.setItem("elite-otp-code", LOCAL_OTP)
    }
    return null
  }, [])

  const loginWithPhone = useCallback(
    async (phone: string, otp: string) => {
      const clean = phone.replace(/\D/g, "")
      const expected = typeof window !== "undefined" ? sessionStorage.getItem("elite-otp-code") : LOCAL_OTP
      if (otp.trim() !== (expected || LOCAL_OTP)) return "رمز التحقق غير صحيح. الرمز التجريبي: 123456"
      const email = `${clean}@phone.elite.iq`
      const found = users.find((u) => u.email === email || u.merchant.phone.replace(/\D/g, "") === clean)
      if (found) {
        commit(users, found.id)
        return null
      }
      return register(clean, email, `phone-${clean}`, { phone: clean, storeName: "" })
    },
    [commit, register, users]
  )

  const logout = useCallback(() => {
    commit(users, null)
  }, [commit, users])

  const completeOnboarding = useCallback(
    (input: { storeName: string; slug: string; phone: string; address: Address }) => {
      patchCurrent((u) => ({
        ...u,
        merchant: {
          ...u.merchant,
          ...input,
          ready: true,
        },
      }))
    },
    [patchCurrent]
  )

  const updateMerchant = useCallback(
    (patch: Partial<MerchantProfile>) => {
      patchCurrent((u) => ({ ...u, merchant: { ...u.merchant, ...patch } }))
    },
    [patchCurrent]
  )

  const upgradePlan = useCallback(
    (planId: string) => {
      const selectedPlan = plans.find((p) => p.id === planId)
      if (!selectedPlan) return

      patchCurrent((u) => ({
        ...u,
        merchant: {
          ...u.merchant,
          plan: selectedPlan.name,
          activePlanId: selectedPlan.id,
          aiModel: selectedPlan.aiModel,
          aiTokenLimit: selectedPlan.monthlyTokenLimit,
          aiTokensUsed: 0,
        },
      }))
    },
    [patchCurrent]
  )

  const incrementAiUsage = useCallback(
    (tokensCount = 1000) => {
      if (!current) return false
      const { aiTokensUsed, aiTokenLimit } = current.merchant
      if (aiTokensUsed >= aiTokenLimit) {
        return false
      }
      patchCurrent((u) => ({
        ...u,
        merchant: {
          ...u.merchant,
          aiTokensUsed: u.merchant.aiTokensUsed + tokensCount,
        },
      }))
      return true
    },
    [current, patchCurrent]
  )

  const connectChannel = useCallback(
    (id: ChannelId, handle: string) => {
      patchCurrent((u) => ({
        ...u,
        channels: u.channels.map((c) =>
          c.id === id
            ? {
                ...c,
                connected: true,
                handle,
                connectedAt: new Date().toLocaleDateString("ar-IQ", { day: "numeric", month: "long", year: "numeric" }),
              }
            : c
        ),
      }))
    },
    [patchCurrent]
  )

  const disconnectChannel = useCallback(
    (id: ChannelId) => {
      patchCurrent((u) => ({
        ...u,
        channels: u.channels.map((c) => (c.id === id ? { ...c, connected: false, handle: "", connectedAt: undefined } : c)),
      }))
    },
    [patchCurrent]
  )

  const addOrder = useCallback(
    (order: Omit<Order, "id" | "date">) => {
      patchCurrent((u) => {
        const id = `#${3400 + u.orders.length + 18}`
        const note: AppNotification = {
          id: uid("n"),
          title: `طلب جديد ${id} من ${order.customer} بقيمة ${order.amount.toLocaleString("ar-IQ")} د.ع`,
          time: "الآن",
          read: false,
          type: "order",
          href: "/orders",
        }
        return {
          ...u,
          orders: [
            {
              ...order,
              id,
              date: new Date().toLocaleDateString("ar-IQ", { day: "numeric", month: "long" }),
            },
            ...u.orders,
          ],
          notifications: [note, ...(u.notifications ?? [])].slice(0, 40),
        }
      })
    },
    [patchCurrent]
  )

  const updateOrderStatus = useCallback(
    (id: string, status: OrderStatus) => {
      patchCurrent((u) => ({
        ...u,
        orders: u.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      }))
    },
    [patchCurrent]
  )

  const updateOrder = useCallback(
    (updatedOrder: Order) => {
      patchCurrent((u) => ({
        ...u,
        orders: u.orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
      }))
    },
    [patchCurrent]
  )

  const deleteOrder = useCallback(
    (id: string) => {
      patchCurrent((u) => ({
        ...u,
        orders: u.orders.filter((o) => o.id !== id),
      }))
    },
    [patchCurrent]
  )

  const addProduct = useCallback(
    (product: Omit<Product, "id" | "sold" | "accent">) => {
      const accents = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]
      patchCurrent((u) => ({
        ...u,
        products: [
          {
            ...product,
            id: uid("p"),
            sold: 0,
            accent: accents[u.products.length % accents.length],
          },
          ...u.products,
        ],
      }))
    },
    [patchCurrent]
  )

  const updateProduct = useCallback(
    (updatedProduct: Product) => {
      patchCurrent((u) => ({
        ...u,
        products: u.products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
      }))
    },
    [patchCurrent]
  )

  const deleteProduct = useCallback(
    (id: string) => {
      patchCurrent((u) => ({
        ...u,
        products: u.products.filter((p) => p.id !== id),
      }))
    },
    [patchCurrent]
  )

  const addRule = useCallback(
    (rule: Omit<ReplyRule, "id" | "hits">) => {
      patchCurrent((u) => ({
        ...u,
        rules: [{ ...rule, id: uid("r"), hits: 0 }, ...u.rules],
      }))
    },
    [patchCurrent]
  )

  const toggleRule = useCallback(
    (id: string) => {
      patchCurrent((u) => ({
        ...u,
        rules: u.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
      }))
    },
    [patchCurrent]
  )

  const deleteRule = useCallback(
    (id: string) => {
      patchCurrent((u) => ({
        ...u,
        rules: u.rules.filter((r) => r.id !== id),
      }))
    },
    [patchCurrent]
  )

  const incrementRuleHits = useCallback(
    (id: string) => {
      patchCurrent((u) => ({
        ...u,
        rules: u.rules.map((r) => (r.id === id ? { ...r, hits: r.hits + 1 } : r)),
      }))
    },
    [patchCurrent]
  )

  const addCoupon = useCallback(
    (coupon: Omit<Coupon, "id" | "used">) => {
      patchCurrent((u) => ({
        ...u,
        coupons: [{ ...coupon, id: uid("c"), used: 0 }, ...(u.coupons ?? [])],
      }))
    },
    [patchCurrent]
  )

  const toggleCoupon = useCallback(
    (id: string) => {
      patchCurrent((u) => ({
        ...u,
        coupons: (u.coupons ?? []).map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
      }))
    },
    [patchCurrent]
  )

  const deleteCoupon = useCallback(
    (id: string) => {
      patchCurrent((u) => ({
        ...u,
        coupons: (u.coupons ?? []).filter((c) => c.id !== id),
      }))
    },
    [patchCurrent]
  )

  const applyCoupon = useCallback(
    (code: string) => {
      if (!current) return null
      const found = (current.coupons ?? []).find((c) => c.active && c.code.toLowerCase() === code.trim().toLowerCase() && c.used < c.maxUses)
      if (!found) return null
      patchCurrent((u) => ({
        ...u,
        coupons: (u.coupons ?? []).map((c) => (c.id === found.id ? { ...c, used: c.used + 1 } : c)),
      }))
      return found
    },
    [current, patchCurrent]
  )

  const pushNotification = useCallback(
    (item: Omit<AppNotification, "id" | "time" | "read">) => {
      const next: AppNotification = {
        ...item,
        id: uid("n"),
        read: false,
        time: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
      }
      patchCurrent((u) => ({
        ...u,
        notifications: [next, ...(u.notifications ?? [])].slice(0, 40),
      }))
    },
    [patchCurrent]
  )

  const markNotificationRead = useCallback(
    (id: string) => {
      patchCurrent((u) => ({
        ...u,
        notifications: (u.notifications ?? []).map((n) => (n.id === id ? { ...n, read: true } : n)),
      }))
    },
    [patchCurrent]
  )

  const markAllNotificationsRead = useCallback(() => {
    patchCurrent((u) => ({
      ...u,
      notifications: (u.notifications ?? []).map((n) => ({ ...n, read: true })),
    }))
  }, [patchCurrent])

  const clearNotifications = useCallback(() => {
    patchCurrent((u) => ({ ...u, notifications: [] }))
  }, [patchCurrent])

  const value = useMemo<AppState>(
    () => ({
      ready,
      user: current ? { id: current.id, name: current.name, email: current.email } : null,
      merchant: current?.merchant ?? null,
      channels: current?.channels ?? CHANNEL_CATALOG,
      orders: current?.orders ?? [],
      products: current?.products ?? [],
      rules: current?.rules ?? [],
      coupons: current?.coupons ?? [],
      notificationsInbox: current?.notifications ?? [],
      language: current?.language ?? language,
      currency: current?.currency ?? currency,
      theme: current?.theme ?? theme,
      
      // 🚀 القيم والتوابع الجديدة للمناقلة
      activeTab,
      setActiveTab,
      globalSearchQuery,
      setGlobalSearchQuery,
      navigateTo,

      setLanguage,
      setCurrency,
      setTheme,
      login,
      loginWithPhone,
      sendLocalOtp,
      register,
      logout,
      completeOnboarding,
      updateMerchant,
      upgradePlan,
      incrementAiUsage,
      connectChannel,
      disconnectChannel,
      addOrder,
      updateOrderStatus,
      updateOrder,
      deleteOrder,
      addProduct,
      updateProduct,
      deleteProduct,
      addRule,
      toggleRule,
      deleteRule,
      incrementRuleHits,
      addCoupon,
      toggleCoupon,
      deleteCoupon,
      applyCoupon,
      pushNotification,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
    }),
    [
      activeTab,
      globalSearchQuery,
      navigateTo,
      addOrder,
      addCoupon,
      applyCoupon,
      loginWithPhone,
      sendLocalOtp,
      pushNotification,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      toggleCoupon,
      deleteCoupon,
      addProduct,
      addRule,
      completeOnboarding,
      connectChannel,
      currency,
      current,
      deleteOrder,
      deleteProduct,
      deleteRule,
      disconnectChannel,
      incrementAiUsage,
      incrementRuleHits,
      language,
      login,
      logout,
      ready,
      register,
      setCurrency,
      setLanguage,
      setTheme,
      theme,
      toggleRule,
      updateMerchant,
      updateOrder,
      updateOrderStatus,
      updateProduct,
      upgradePlan,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

export { DEMO_EMAIL, DEMO_PASSWORD, LOCAL_OTP }