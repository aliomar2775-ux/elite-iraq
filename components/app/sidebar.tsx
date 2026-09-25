"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageCircle,
  CreditCard,
  Settings,
  LifeBuoy,
  Store,
  Sparkles,
  Percent,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DEMO_EMAIL, useApp } from "@/lib/app-state"

const nav = [
  { label: "نظرة عامة", href: "/", icon: LayoutDashboard },
  { label: "المنتجات والمخزون", href: "/products", icon: Package },
  { label: "الطلبات والشحن", href: "/orders", icon: ShoppingBag },
  { label: "العروض الخاصة والتصفية", href: "/clearance", icon: Percent },
  { label: "ربط المتاجر", href: "/channels", icon: Store },
  { label: "الردود التلقائية", href: "/chatbot", icon: MessageCircle },
  { label: "الفوترة والاشتراك", href: "/billing", icon: CreditCard },
]

const secondary = [
  { label: "الإعدادات", href: "/settings", icon: Settings, external: false },
  { label: "الدعم (تليجرام)", href: "https://t.me/noor_elet", icon: LifeBuoy, external: true },
]

export function SidebarContent({
  onNavigate,
  onUpgrade,
}: {
  onNavigate?: () => void
  onUpgrade?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useApp() // 👈 جلب بيانات المستخدم الحالي للتحقق من بريده الحصري

  const handleUpgrade = () => {
    if (onNavigate) onNavigate()
    if (onUpgrade) {
      onUpgrade()
    } else {
      router.push("/billing")
    }
  }

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  // التحقق الحصري من بريد الأدمن
  const isSuperAdmin = user?.email?.toLowerCase() === DEMO_EMAIL.toLowerCase()

  return (
    <div className="flex h-full flex-col rtl text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground overflow-hidden p-1 shadow-xs border border-primary/20 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full fill-current" aria-hidden="true">
            <path
              d="M50 15 L80 30 L80 55 C80 75 50 90 50 90 C50 90 20 75 20 55 L20 30 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="33" y="38" width="8" height="28" rx="2" />
            <rect x="46" y="25" width="8" height="41" rx="2" />
            <rect x="59" y="44" width="8" height="22" rx="2" />
            <path
              d="M28 58 L45 46 L58 55 L75 38"
              fill="none"
              stroke="currentColor"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="leading-tight">
          <span className="block text-base font-bold tracking-tight text-sidebar-foreground">إيليت العراق</span>
          <span className="block text-[10px] text-muted-foreground font-medium">النخبة العراقية</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">القائمة</p>
        {nav.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={isLinkActive(item.href)}
            onNavigate={onNavigate}
          />
        ))}

        {/* 👈 يظهر زر الأدمن حصرياً لبريد الأدمن الخاص بك فقط ولا يظهر في الحسابات التجريبية */}
        {isSuperAdmin && (
          <>
            <p className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-wider text-amber-500/90">الإدارة المركزية</p>
            <NavItem
              label="لوحة الأدمن"
              href="/admin"
              icon={ShieldCheck}
              active={isLinkActive("/admin")}
              onNavigate={onNavigate}
              highlight
            />
          </>
        )}

        <p className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">عام</p>
        {secondary.map((item) => (
          <NavItem
            key={item.label}
            {...item}
            active={!item.external && isLinkActive(item.href)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="m-3 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3.5 shadow-xs">
        <div className="flex items-center gap-2 text-sidebar-accent-foreground">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs font-bold">فعّل الردود الذكية</p>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          دع الذكاء الاصطناعي يرد على عملائك تلقائيًا ويحوّل الرسائل إلى طلبات.
        </p>
        <button
          onClick={handleUpgrade}
          className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
        >
          الترقية إلى الاحترافية
        </button>
      </div>
    </div>
  )
}

function NavItem({
  label,
  href,
  icon: Icon,
  active,
  external,
  highlight,
  onNavigate,
}: {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
  external?: boolean
  highlight?: boolean
  onNavigate?: () => void
}) {
  const className = cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold transition-all cursor-pointer",
    active
      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-xs font-bold"
      : highlight
        ? "text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
        : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
  )

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={className}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        <span>{label}</span>
      </a>
    )
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={className}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span>{label}</span>
    </Link>
  )
}