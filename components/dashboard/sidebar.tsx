"use client"

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
} from "lucide-react"
import { useApp } from "@/lib/app-state"
import { cn } from "@/lib/utils"

export interface NavItemConfig {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  external?: boolean
  href?: string
}

const navItems: NavItemConfig[] = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "products", label: "المنتجات والمخزون", icon: Package },
  { id: "orders", label: "الطلبات والشحن", icon: ShoppingBag },
  { id: "clearance", label: "العروض والتصفية", icon: Percent },
  { id: "channels", label: "ربط المتاجر", icon: Store },
  { id: "chatbot", label: "الردود التلقائية", icon: MessageCircle },
  { id: "billing", label: "الفوترة والاشتراك", icon: CreditCard },
]

const secondaryItems: NavItemConfig[] = [
  { id: "settings", label: "الإعدادات", icon: Settings },
  {
    id: "support",
    label: "الدعم (تليجرام)",
    icon: LifeBuoy,
    external: true,
    href: "https://t.me/noor_elet",
  },
]

export function Sidebar({
  activeTab: propActiveTab,
  onSelectTab,
}: {
  activeTab?: string
  onSelectTab?: (tab: string) => void
}) {
  const { activeTab: contextActiveTab, setActiveTab, navigateTo } = useApp()

  const currentTab = propActiveTab || contextActiveTab || "overview"

  const handleTabClick = (item: NavItemConfig) => {
    if (item.external && item.href) {
      window.open(item.href, "_blank", "noopener,noreferrer")
      return
    }

    if (onSelectTab) {
      onSelectTab(item.id)
    }

    if (navigateTo) {
      navigateTo(item.id)
    } else if (setActiveTab) {
      setActiveTab(item.id)
    }
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-l border-sidebar-border bg-sidebar md:flex rtl text-sidebar-foreground select-none">
      {/* 1️⃣ الشعار والهوية */}
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
          <span className="block text-base font-bold tracking-tight text-sidebar-foreground">
            إيليت العراق
          </span>
          <span className="block text-[10px] text-muted-foreground font-medium">النخبة العراقية</span>
        </div>
      </div>

      {/* 2️⃣ القائمة الرئيسية */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
          القائمة
        </p>
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={currentTab === item.id}
            onClick={() => handleTabClick(item)}
          />
        ))}

        <p className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
          عام
        </p>
        {secondaryItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={currentTab === item.id}
            onClick={() => handleTabClick(item)}
          />
        ))}
      </nav>

      {/* 3️⃣ كارت الترقية الذكي */}
      <div className="m-3 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3.5 shadow-xs">
        <div className="flex items-center gap-2 text-sidebar-accent-foreground">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs font-bold">فعّل الردود الذكية</p>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          دع الذكاء الاصطناعي يرد على عملائك تلقائيًا ويحوّل الرسائل إلى طلبات.
        </p>
        <button
          onClick={() => handleTabClick({ id: "billing", label: "الفوترة", icon: CreditCard })}
          className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
        >
          الترقية إلى الاحترافية
        </button>
      </div>
    </aside>
  )
}

function NavItem({
  item,
  active,
  onClick,
}: {
  item: NavItemConfig
  active?: boolean
  onClick?: () => void
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold transition-all cursor-pointer text-right",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-xs"
          : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="truncate">{item.label}</span>
    </button>
  )
}