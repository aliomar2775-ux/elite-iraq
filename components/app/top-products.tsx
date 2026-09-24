"use client"

import { useCallback } from "react"
import { topProducts } from "@/lib/data"
import { useApp } from "@/lib/app-state"
import { formatIQD } from "@/lib/iraq"
import { formatPrice } from "@/lib/utils"
import { Flame } from "lucide-react"

export function TopProducts() {
  const { currency } = useApp()

  const renderMoney = useCallback(
    (amount: number) => {
      return currency === "IQD" ? formatIQD(amount) : formatPrice(amount, currency)
    },
    [currency]
  )

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs rtl text-foreground">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-foreground">المنتجات الأكثر مبيعًا</h2>
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Flame className="h-3 w-3" />
              الأعلى طلبًا
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            أداء أفضل المنتجات حركةً خلال آخر 30 يومًا ({currency === "IQD" ? "بالدينار العراقي" : "بالدولار"})
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {topProducts && topProducts.length > 0 ? (
          topProducts.map((p) => {
            const salesValue = typeof p.sales === "number" ? p.sales : 15000
            return (
              <div key={p.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: p.accent || "var(--primary)" }}
                    />
                    <span className="font-bold text-foreground truncate">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono shrink-0">
                    <span className="text-[11px] text-muted-foreground font-medium">({p.share}%)</span>
                    <span className="font-bold text-primary">{renderMoney(salesValue)}</span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, p.share))}%`,
                      backgroundColor: p.accent || "var(--primary)",
                    }}
                  />
                </div>
              </div>
            )
          })
        ) : (
          <p className="py-6 text-center text-xs text-muted-foreground">لا توجد بيانات متاحة حالياً للمنتجات الأكثر مبيعاً.</p>
        )}
      </div>
    </section>
  )
}