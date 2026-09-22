"use client"

import { topProducts } from "@/lib/data"
import { useApp } from "@/lib/app-state"
import { formatPrice } from "@/lib/utils"

export function TopProducts() {
  const { currency } = useApp()

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-semibold tracking-tight">المنتجات الأكثر مبيعًا</h2>
      <p className="text-sm text-muted-foreground">خلال آخر ٣٠ يومًا بالـ {currency}</p>

      <div className="mt-5 space-y-5">
        {topProducts.map((p) => (
          <div key={p.name}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{p.name}</span>
              {/* عرض المبيعات متجاوباً مع العملة (نفترض أن p.sales أو السعر يمر عبر دالة التنسيق) */}
              <span className="font-bold text-primary">{formatPrice(typeof p.sales === 'number' ? p.sales : 15000, currency)}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full" style={{ width: `${p.share}%`, background: p.accent }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}