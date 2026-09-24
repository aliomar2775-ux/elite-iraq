"use client"

import { Sparkles } from "lucide-react"

export function DailyInsights() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs rtl text-foreground">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold">تحليلات الذكاء الاصطناعي اليومية</h3>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        تم تفعيل المكون بنجاح على جهازك الشخصي الجديد! النظام جاهز لمتابعة الأداء والتحليلات.
      </p>
    </div>
  )
}