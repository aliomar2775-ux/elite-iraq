"use client"

import Link from "next/link"
import { OrderStatusBadge } from "@/components/app/status-badge"
import { useApp } from "@/lib/app-state"
import { formatIQD } from "@/lib/iraq"
import { formatPrice } from "@/lib/utils"

export function RecentOrders() {
  const { orders, currency } = useApp()
  const rows = orders.slice(0, 6)

  const renderMoney = (amount: number) => {
    return currency === "IQD" ? formatIQD(amount) : formatPrice(amount, currency)
  }

  return (
    <section className="rounded-xl border border-border bg-card shadow-xs rtl text-foreground">
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/60">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground">أحدث الطلبات</h2>
          <p className="text-xs text-muted-foreground mt-0.5">آخر الطلبات الواردة من قنواتك المختلفة</p>
        </div>
        <Link
          href="/orders"
          className="text-xs font-bold text-primary hover:underline transition-all"
        >
          عرض الكل ←
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-right text-muted-foreground">
              <th className="whitespace-nowrap px-4 py-3 font-semibold">الطلب</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">العميل</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">القناة</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">المبلغ ({currency === "IQD" ? "د.ع" : "$"})</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-foreground">{o.id}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="font-bold text-foreground">{o.customer || "زبون"}</div>
                  {o.phone && <div className="text-[10px] font-mono text-muted-foreground">{o.phone}</div>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{o.channel}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-foreground">
                  {renderMoney(o.amount || 0)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <OrderStatusBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="py-8 text-center text-xs text-muted-foreground">
          لا توجد طلبات واردة مؤخراً.
        </div>
      )}
    </section>
  )
}