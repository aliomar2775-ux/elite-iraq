"use client"

import { useCallback } from "react"
import { useApp } from "@/lib/app-state"
import { formatIQD } from "@/lib/iraq"
import { formatPrice, cn } from "@/lib/utils"
import { ShoppingBag, ArrowLeft } from "lucide-react"

export interface LocalOrder {
  id: string
  customer: string
  email?: string
  phone?: string
  status: string
  date: string
  amount: number
}

const defaultOrders: LocalOrder[] = [
  {
    id: "#1084",
    customer: "علي حسين",
    phone: "07701234567",
    status: "مؤكد",
    date: "اليوم، 02:15 م",
    amount: 45000,
  },
  {
    id: "#1083",
    customer: "سارة أحمد",
    phone: "07809876543",
    status: "قيد التجهيز",
    date: "اليوم، 11:30 ص",
    amount: 35000,
  },
  {
    id: "#1082",
    customer: "محمد جاسم",
    phone: "07501112233",
    status: "تم الشحن",
    date: "أمس، 05:20 م",
    amount: 80000,
  },
  {
    id: "#1081",
    customer: "عمر الفاروق",
    phone: "07712223344",
    status: "تم التوصيل",
    date: "أمس، 01:10 م",
    amount: 120000,
  },
]

const statusStyles: Record<string, string> = {
  "مدفوع": "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  "مؤكد": "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  "قيد التجهيز": "bg-amber-500/15 text-amber-500 border-amber-500/30",
  "تم الشحن": "bg-sky-500/15 text-sky-500 border-sky-500/30",
  "تم التوصيل": "bg-emerald-600/15 text-emerald-600 border-emerald-600/30",
  "ملغي": "bg-muted text-muted-foreground border-border",
  "مسترجع": "bg-destructive/15 text-destructive border-destructive/30",
  // الدعم المباشر للحالات بالإنجليزية كاحتياط
  Paid: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  Pending: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  Refunded: "bg-destructive/15 text-destructive border-destructive/30",
}

export function RecentOrders() {
  const { orders: contextOrders = [], currency, setActiveTab } = useApp()

  const renderMoney = useCallback(
    (amount: number) => {
      return currency === "IQD" ? formatIQD(amount) : formatPrice(amount, currency)
    },
    [currency]
  )

  // دمج الطلبات من Context المنصة أو استخدام البيانات الافتراضية
  const displayOrders: LocalOrder[] =
    contextOrders && contextOrders.length > 0
      ? contextOrders.slice(0, 5).map((o) => ({
          id: o.id,
          customer: o.customer || "زبون",
          phone: o.phone || "",
          status: o.status || "مؤكد",
          date: o.date || "اليوم",
          amount: o.amount || 0,
        }))
      : defaultOrders

  return (
    <section className="rounded-xl border border-border bg-card shadow-xs rtl text-foreground text-right overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary shrink-0" />
            <h2 className="font-bold text-sm sm:text-base tracking-tight text-foreground">
              حدث الطلبات
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            آخر المعاملات والطلبات المسجلة في متجرك
          </p>
        </div>

        <button
          onClick={() => setActiveTab && setActiveTab("orders")}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer shadow-xs"
        >
          <span>عرض كافة الطلبات</span>
          <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-right">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground font-bold">
              <th className="px-4 sm:px-5 py-3">رقم الطلب</th>
              <th className="px-4 sm:px-5 py-3">الزبون</th>
              <th className="px-4 sm:px-5 py-3">حالة الطلب</th>
              <th className="px-4 sm:px-5 py-3">التاريخ</th>
              <th className="px-4 sm:px-5 py-3 text-left">المبلغ الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {displayOrders.map((order) => {
              const style = statusStyles[order.status] || "bg-muted text-muted-foreground border-border"
              return (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-muted/40 cursor-pointer"
                  onClick={() => setActiveTab && setActiveTab("orders")}
                >
                  <td className="px-4 sm:px-5 py-3 font-mono font-bold text-primary">{order.id}</td>
                  <td className="px-4 sm:px-5 py-3">
                    <div className="font-bold text-foreground">{order.customer}</div>
                    {order.phone && (
                      <div className="text-[10px] text-muted-foreground font-mono">{order.phone}</div>
                    )}
                  </td>
                  <td className="px-4 sm:px-5 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition-colors",
                        style
                      )}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-5 py-3 text-muted-foreground font-medium">{order.date}</td>
                  <td className="px-4 sm:px-5 py-3 text-left font-mono font-bold text-foreground">
                    {renderMoney(order.amount)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}