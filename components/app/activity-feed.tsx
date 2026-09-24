"use client"

import { activity as staticActivity, type Activity } from "@/lib/data"
import { Activity as ActivityIcon, MessageSquare, ShoppingBag, Radio } from "lucide-react"

// أنشطة تجريبية توضيحية في حال كانت قائمة الأنشطة فارغة
const defaultActivities: Activity[] = [
  {
    id: "act-1",
    who: "علي حسين",
    action: "قام بتأكيد طلب جديد لـ (ساعة Ultra الذكية)",
    when: "منذ ٥ دقائق",
    channel: "إنستغرام",
  },
  {
    id: "act-2",
    who: "البوت التلقائي",
    action: "أرسل تفاصيل التوصيل والأسعار للزبون",
    when: "منذ ١٢ دقيقة",
    channel: "واتساب",
  },
  {
    id: "act-3",
    who: "سيف السلام",
    action: "استفسر عن توفر لون جديد من سماعات Pro",
    when: "منذ ٣٠ دقيقة",
    channel: "تيك توك",
  },
]

export function ActivityFeed({ items }: { items?: Activity[] }) {
  // استخدام الأنشطة الممررة، أو المستوردة، أو العينة التوضيحية
  const list = items && items.length > 0 
    ? items 
    : staticActivity.length > 0 
      ? staticActivity 
      : defaultActivities

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm rtl">
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <div>
          <h2 className="font-semibold tracking-tight text-sm flex items-center gap-2">
            <ActivityIcon className="h-4 w-4 text-primary" />
            النشاط الأخير
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">تحديثات لحظية ومباشرة من متجرك</p>
        </div>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      {list.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
          <p className="font-medium">لا يوجد نشاط أخير حالياً</p>
          <p className="text-[11px] text-muted-foreground/80">ستظهر هنا التحديثات فور تفاعل الزبائن مع المتجر</p>
        </div>
      ) : (
        <ol className="space-y-4">
          {list.map((a, i) => (
            <li key={a.id || i} className="flex gap-3 text-xs">
              <div className="mt-1 flex flex-col items-center">
                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                {i < list.length - 1 ? <span className="mt-1 h-full w-px flex-1 bg-border" /> : null}
              </div>
              <div className="pb-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="leading-snug text-foreground">
                    <span className="font-bold">{a.who}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>
                  </p>
                  {a.channel && (
                    <span className="shrink-0 rounded bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground border border-border/50">
                      {a.channel}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground font-mono">{a.when}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}