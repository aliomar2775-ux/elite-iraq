"use client"

import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, Bot, Percent, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StatItem {
  label: string
  value: string | number
  delta: number
  hint?: string
}

const defaultStats: StatItem[] = [
  { label: "إجمالي المبيعات", value: "1,250,000 د.ع", delta: 12.5, hint: "مقارنة بالأسبوع الماضي" },
  { label: "الطلبات الجديدة", value: "84 طلب", delta: 8.2, hint: "+12 طلب اليوم" },
  { label: "ردود البوت الآلي", value: "1,420", delta: 24.1, hint: "توفير 18 ساعة عمل" },
  { label: "نسبة التحويل", value: "4.8%", delta: -1.5, hint: "يحتاج تحسين في سلة الشراء" },
]

function getStatIcon(label: string) {
  if (label.includes("مبيعات") || label.includes("إيرادات") || label.includes("د.ع")) {
    return {
      icon: <DollarSign className="h-4 w-4 text-emerald-500" />,
      bg: "bg-emerald-500/15 border border-emerald-500/20",
    }
  }
  if (label.includes("طلب") || label.includes("الطلبات")) {
    return {
      icon: <ShoppingBag className="h-4 w-4 text-sky-500" />,
      bg: "bg-sky-500/15 border border-sky-500/20",
    }
  }
  if (label.includes("ردود") || label.includes("رسائل") || label.includes("البوت")) {
    return {
      icon: <Bot className="h-4 w-4 text-purple-500" />,
      bg: "bg-purple-500/15 border border-purple-500/20",
    }
  }
  if (label.includes("تحويل") || label.includes("نسبة")) {
    return {
      icon: <Percent className="h-4 w-4 text-amber-500" />,
      bg: "bg-amber-500/15 border border-amber-500/20",
    }
  }
  return {
    icon: <Activity className="h-4 w-4 text-primary" />,
    bg: "bg-primary/15 border border-primary/20",
  }
}

export function StatCards({ stats }: { stats?: StatItem[] }) {
  const list = stats && stats.length > 0 ? stats : defaultStats

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 rtl text-foreground text-right">
      {list.map((stat) => {
        const positive = stat.delta >= 0
        const { icon, bg } = getStatIcon(stat.label)

        return (
          <div
            key={stat.label}
            className="group rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-muted-foreground">{stat.label}</p>
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 shrink-0",
                  bg
                )}
              >
                {icon}
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {stat.value}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold font-mono border shrink-0",
                  positive
                    ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                    : "bg-destructive/15 text-destructive border-destructive/30"
                )}
              >
                {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {positive ? "+" : ""}
                {Math.abs(stat.delta)}%
              </span>
            </div>

            {stat.hint && (
              <p className="mt-2 text-[11px] text-muted-foreground font-medium">
                {stat.hint}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}