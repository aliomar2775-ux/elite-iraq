"use client"

import { Activity } from "lucide-react"

export interface ActivityItem {
  who: string
  action: string
  when: string
}

const defaultActivityList: ActivityItem[] = [
  { who: "علي حسين", action: "أكمل طلباً جديداً #1084", when: "منذ 5 دقائق" },
  { who: "البوت الذكي", action: "رد تلقائياً على استفسار في إنستغرام", when: "منذ 12 دقيقة" },
  { who: "سارة أحمد", action: "أضافت منتجاً جديداً إلى السلة", when: "منذ 25 دقيقة" },
  { who: "نظام الشحن", action: "تم تحديث حالة الطلب #1081 إلى تم التوصيل", when: "منذ ساعة" },
]

export function ActivityFeed({ items }: { items?: ActivityItem[] }) {
  const list = items && items.length > 0 ? items : defaultActivityList

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs rtl text-foreground text-right">
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Activity className="h-4 w-4 text-primary shrink-0" />
        <div>
          <h2 className="font-bold text-sm sm:text-base tracking-tight text-foreground">
            آخر النشاطات والتحديثات
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            متابعة الأحداث والرسائل والطلبات الحية في المتجر
          </p>
        </div>
      </div>

      <ol className="mt-4 space-y-4 pr-2">
        {list.map((item, i) => (
          <li key={i} className="relative flex gap-3 pr-4">
            {/* نقطة المؤشر للخط الزمني */}
            <span className="absolute right-0 top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-primary/10" />

            {/* الخط الرابط العمودي */}
            {i < list.length - 1 && (
              <span
                className="absolute right-[3px] top-4 h-[calc(100%+8px)] w-px bg-border/80"
                aria-hidden="true"
              />
            )}

            <div className="text-xs space-y-0.5">
              <p className="leading-snug">
                <span className="font-bold text-foreground">{item.who}</span>{" "}
                <span className="text-muted-foreground font-medium">{item.action}</span>
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">{item.when}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}