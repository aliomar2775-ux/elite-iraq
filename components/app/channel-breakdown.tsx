"use client"

import { useMemo } from "react"
import { useApp } from "@/lib/app-state"
import { channelBreakdown as staticBreakdown, type Channel, type ChannelBreakdown as ChannelBreakdownType } from "@/lib/data"
import { formatIQD } from "@/lib/iraq"
import { formatPrice } from "@/lib/utils"

const colors: Record<Channel, string> = {
  "إنستغرام": "var(--chart-1)",
  "واتساب": "var(--chart-2)",
  "تيك توك": "var(--chart-3)",
  "سناب شات": "var(--chart-4)",
}

// بيانات توضيحية احتياطية في حالة خلو المتجر من الطلبات
const sampleBreakdown: { channel: Channel; share: number; salesAmount: number }[] = [
  { channel: "إنستغرام", share: 45, salesAmount: 1850000 },
  { channel: "واتساب", share: 30, salesAmount: 1200000 },
  { channel: "تيك توك", share: 15, salesAmount: 600000 },
  { channel: "سناب شات", share: 10, salesAmount: 350000 },
]

export function ChannelBreakdown() {
  const { orders, currency } = useApp()

  // دالة موحدة لتنسيق أسعار المبيعات بالعملة المختارة
  const formatAmount = (amount: number) => {
    return currency === "IQD" ? formatIQD(amount) : formatPrice(amount, currency)
  }

  // حساب التوزيع المالي والحصص المئوية لقنوات المبيعات تلقائياً من مصفوفة الطلبات
  const breakdownData = useMemo(() => {
    if (!orders || orders.length === 0) {
      return sampleBreakdown.map((item) => ({
        channel: item.channel,
        share: item.share,
        salesFormatted: formatAmount(item.salesAmount),
      }))
    }

    const channelTotals: Record<Channel, number> = {
      "إنستغرام": 0,
      "واتساب": 0,
      "تيك توك": 0,
      "سناب شات": 0,
    }

    let grandTotal = 0

    orders.forEach((o) => {
      if (o.status !== "ملغي" && o.status !== "مسترجع") {
        const chan = o.channel || "واتساب"
        channelTotals[chan] = (channelTotals[chan] || 0) + o.amount
        grandTotal += o.amount
      }
    })

    const channelsList: Channel[] = ["إنستغرام", "واتساب", "تيك توك", "سناب شات"]

    return channelsList.map((chan) => {
      const salesAmount = channelTotals[chan] || 0
      const share = grandTotal > 0 ? Math.round((salesAmount / grandTotal) * 100) : 0

      return {
        channel: chan,
        share,
        salesFormatted: formatAmount(salesAmount),
      }
    })
  }, [orders, currency])

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm rtl">
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <div>
          <h2 className="font-semibold tracking-tight text-sm text-foreground">المبيعات حسب القناة</h2>
          <p className="text-xs text-muted-foreground mt-0.5">توزيع الإيرادات الفعلية لقنوات التواصل</p>
        </div>
      </div>

      <div className="space-y-4">
        {breakdownData.map((c) => (
          <div key={c.channel}>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: colors[c.channel] || "var(--primary)" }}
                />
                {c.channel}
                <span className="text-[10px] font-mono text-muted-foreground">({c.share}%)</span>
              </span>
              <span className="font-bold font-mono text-foreground">{c.salesFormatted}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/80 relative">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${c.share}%`,
                  background: colors[c.channel] || "var(--primary)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}