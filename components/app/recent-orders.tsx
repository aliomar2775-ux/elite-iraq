"use client"

import Link from "next/link"
import { OrderStatusBadge } from "@/components/app/status-badge"
import { useApp } from "@/lib/app-state"
import { formatIQD } from "@/lib/iraq"

export function RecentOrders() {
  const { orders } = useApp()
  const rows = orders.slice(0, 6)
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between p-5">
        <div>
          <h2 className="font-semibold tracking-tight">أحدث الطلبات</h2>
          <p className="text-sm text-muted-foreground">آخر الطلبات الواردة من قنواتك</p>
        </div>
        <Link href="/orders" className="text-sm font-medium text-primary hover:underline">
          عرض الكل
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-border text-right text-muted-foreground">
              <th className="whitespace-nowrap px-5 py-3 font-medium">الطلب</th>
              <th className="whitespace-nowrap px-5 py-3 font-medium">العميل</th>
              <th className="whitespace-nowrap px-5 py-3 font-medium">القناة</th>
              <th className="whitespace-nowrap px-5 py-3 font-medium">المبلغ</th>
              <th className="whitespace-nowrap px-5 py-3 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="whitespace-nowrap px-5 py-3 font-medium">{o.id}</td>
                <td className="whitespace-nowrap px-5 py-3">{o.customer}</td>
                <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">{o.channel}</td>
                <td className="whitespace-nowrap px-5 py-3 font-medium">{formatIQD(o.amount)}</td>
                <td className="whitespace-nowrap px-5 py-3">
                  <OrderStatusBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
