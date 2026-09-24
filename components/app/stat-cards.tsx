"use client"

import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, Bot, Percent, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Stat } from "@/lib/data"

/**
 * دالة مساعدة لتحديد الأيقونة ولون الخلفية المناسب بناءً على عنوان الإحصائية
 */
function getStatIcon(label: string) {
  if (label.includes("مبيعات") || label.includes("إيرادات")) {
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
  if (label.includes("ردود") || label.includes("رسائل") || label.includes("معالجة")) {
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

export function StatCards({ stats = [] }: { stats?: Stat[] }) {
  if (!stats || stats.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 rtl text-foreground">
      {stats.map((s) => {
        const up = s.delta >= 0
        const { icon, bg } = getStatIcon(s.label)

        return (
          <div
            key={s.label}
            className="group rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-muted-foreground">{s.label}</p>
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 shrink-0",
                  bg
                )}
              >
                {icon}
              </div>
            </div>

            <p className="mt-3 text-2xl font-bold tracking-tight text-foreground font-mono">
              {s.value}
            </p>

            <div className="mt-3 flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-bold text-[10px] font-mono border",
                  up
                    ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                    : "bg-destructive/15 text-destructive border-destructive/30"
                )}
              >
                {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {up ? "+" : ""}
                {s.delta}%
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">{s.hint}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}