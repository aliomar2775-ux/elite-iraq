"use client"

import { Sparkles, TrendingUp, ShieldAlert } from "lucide-react"

export function DailyInsights() {
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs rtl text-foreground text-right">
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Sparkles className="h-4 w-4 text-primary shrink-0" />
        <div>
          <h3 className="font-bold text-sm sm:text-base text-foreground">
            ملخص وتحليلات اليوم الذكية
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            رؤى وتوصيات حية مستخرجة من حركة المتجر
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
          <TrendingUp className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">ارتفاع مبيعات بغداد</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              زيادة الطلبات بنسبة 15% من محافظة بغداد خلال الـ 24 ساعة الماضية.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">استجابة الشات بوت</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              تم الرد التلقائي على 94% من استفسارات الأسعار دون تدخل بشري.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}