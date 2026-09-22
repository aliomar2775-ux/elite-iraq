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
      bg: "bg-emerald-500/10",
    }
  }
  if (label.includes("طلب") || label.includes("الطلبات")) {
    return {
      icon: <ShoppingBag className="h-4 w-4 text-blue-500" />,
      bg: "bg-blue-500/10",
    }
  }
  if (label.includes("ردود") || label.includes("رسائل") || label.includes("معالجة")) {
    return {
      icon: <Bot className="h-4 w-4 text-purple-500" />,
      bg: "bg-purple-500/10",
    }
  }
  if (label.includes("تحويل") || label.includes("نسبة")) {
    return {
      icon: <Percent className="h-4 w-4 text-amber-500" />,
      bg: "bg-amber-500/10",
    }
  }
  return {
    icon: <Activity className="h-4 w-4 text-primary" />,
    bg: "bg-primary/10",
  }
}

export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => {
        const up = s.delta >= 0
        const { icon, bg } = getStatIcon(s.label)

        return (
          <div
            key={s.label}
            className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-105", bg)}>
                {icon}
              </div>
            </div>

            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{s.value}</p>

            <div className="mt-3 flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold text-[11px]",
                  up ? "bg-emerald-500/15 text-emerald-500" : "bg-destructive/15 text-destructive"
                )}
              >
                {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {up ? "+" : ""}
                {s.delta}%
              </span>
              <span className="text-[11px] text-muted-foreground">{s.hint}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}