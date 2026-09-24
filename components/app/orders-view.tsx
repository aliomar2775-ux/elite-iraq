"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Truck, PackageCheck, Clock, RotateCcw, Filter, MapPin, Tag, Edit2, Trash2, X } from "lucide-react"
import { type OrderStatus, type Order } from "@/lib/data"
import { OrderStatusBadge } from "@/components/app/status-badge"
import { OrderForm } from "@/components/app/order-form"
import { Modal } from "@/components/app/modal"
import { useApp } from "@/lib/app-state"
import { IRAQ_GOVERNORATES, formatIQD } from "@/lib/iraq"
import { formatPrice, cn } from "@/lib/utils"

const orderStatuses: OrderStatus[] = [
  "قيد التجهيز",
  "تم الشحن",
  "تم التوصيل",
  "مدفوع",
  "مسترجع",
  "ملغي",
]

// دالة تقييس النصوص العربية للبحث بمرونة وتجاهل الهمزات والتشكيل
function normalizeArabic(input: string): string {
  if (!input) return ""
  return input
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .trim()
    .toLowerCase()
}

export function OrdersView({ onCreate }: { onCreate?: boolean }) {
  // جلب العملة والبيانات من السياق المركزي
  const { orders, updateOrderStatus, updateOrder, deleteOrder, currency } = useApp()
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("الكل")
  const [selectedStatus, setSelectedStatus] = useState<string>("الكل")
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  // حالات نافذة التعديل والحذف
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 🎯 الاستماع الفوري لحدث التصفية القادم من شريط البحث العلوي (Topbar)
  useEffect(() => {
    const handleFilterOrder = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        setQuery(customEvent.detail)
        setSelectedGovernorate("الكل") // العودة لجميع المحافظات لضمان عدم إخفاء الطلب
        setSelectedStatus("الكل") // العودة لجميع الحالات
      }
    }

    window.addEventListener("filter-orders", handleFilterOrder as EventListener)
    return () => window.removeEventListener("filter-orders", handleFilterOrder as EventListener)
  }, [])

  // حساب أرقام الملخصات ديناميكياً مع التخزين التلقائي
  const summary = useMemo(() => [
    { label: "قيد التجهيز", value: orders.filter((o) => o.status === "قيد التجهيز").length, icon: Clock, tint: "text-warning bg-warning/15" },
    { label: "قيد الشحن", value: orders.filter((o) => o.status === "تم الشحن").length, icon: Truck, tint: "text-primary bg-primary/15" },
    { label: "تم التوصيل", value: orders.filter((o) => o.status === "تم التوصيل").length, icon: PackageCheck, tint: "text-success bg-success/15" },
    { label: "مرتجعات", value: orders.filter((o) => o.status === "مسترجع").length, icon: RotateCcw, tint: "text-destructive bg-destructive/15" },
  ], [orders])

  // تصفية الطلبات بمرونة عربية وتجنب استخدام any
  const filteredOrders = useMemo(() => {
    const cleanQ = normalizeArabic(query)

    return orders.filter((o) => {
      const matchesGovernorate = selectedGovernorate === "الكل" || o.governorate === selectedGovernorate
      const matchesStatus = selectedStatus === "الكل" || o.status === selectedStatus
      
      if (!cleanQ) return matchesGovernorate && matchesStatus

      const customerStr = normalizeArabic(o.customer || "")
      const idStr = normalizeArabic(o.id || "")
      const cityStr = normalizeArabic(o.city || "")
      const govStr = normalizeArabic(o.governorate || "")
      const phoneStr = normalizeArabic(o.phone || "")

      const matchesQuery = 
        customerStr.includes(cleanQ) ||
        idStr.includes(cleanQ) ||
        cityStr.includes(cleanQ) ||
        govStr.includes(cleanQ) ||
        phoneStr.includes(cleanQ)

      return matchesGovernorate && matchesStatus && matchesQuery
    })
  }, [orders, selectedGovernorate, selectedStatus, query])

  // حساب إجمالي المبلغ المصفى
  const filteredTotalAmount = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + (order.amount || 0), 0)
  }, [filteredOrders])

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOrder) return
    if (updateOrder) {
      updateOrder(editingOrder)
    }
    setEditingOrder(null)
  }

  const handleConfirmDelete = () => {
    if (deletingId && deleteOrder) {
      deleteOrder(deletingId)
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-6 rtl">
      {onCreate ? (
        <div className="flex justify-end">
          <button onClick={() => setOpen(true)} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            طلب جديد
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", s.tint)}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">{s.value.toLocaleString("ar-IQ")}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">تصفية الطلبات</h3>
          </div>
          {(selectedGovernorate !== "الكل" || selectedStatus !== "الكل" || query) && (
            <button
              onClick={() => {
                setSelectedGovernorate("الكل")
                setSelectedStatus("الكل")
                setQuery("")
              }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
            >
              إعادة ضبط الفلاتر
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              المحافظة العراقية
            </label>
            <select
              value={selectedGovernorate}
              onChange={(e) => setSelectedGovernorate(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none focus:border-ring focus:bg-background transition-colors"
            >
              <option value="الكل">جميع المحافظات ({orders.length})</option>
              {IRAQ_GOVERNORATES.map((gov) => {
                const count = orders.filter((o) => o.governorate === gov.name).length
                return (
                  <option key={gov.id} value={gov.name}>
                    {gov.name} {count > 0 ? `(${count})` : ""}
                  </option>
                )
              })}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              حالة التوصيل / الطلب
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none focus:border-ring focus:bg-background transition-colors"
            >
              <option value="الكل">جميع الحالات</option>
              {orderStatuses.map((st) => {
                const count = orders.filter((o) => o.status === st).length
                return (
                  <option key={st} value={st}>
                    {st} {count > 0 ? `(${count})` : ""}
                  </option>
                )
              })}
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              البحث في الطلبات
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث برقم الطلب، اسم العميل، المدينة..."
                className="h-10 w-full rounded-lg border border-border bg-muted/30 pr-10 pl-8 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:bg-background transition-colors"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  title="مسح البحث"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* تنبيه التصفية المباشرة */}
        {query && (
          <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-xs text-emerald-500">
            <span>عرض نتائج البحث عن: <strong>"{query}"</strong></span>
            <button onClick={() => setQuery("")} className="underline font-bold hover:text-emerald-400">
              إظهار كافة الطلبات
            </button>
          </div>
        )}

        {/* إجمالي المبيعات بالعملة الديناميكية */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <div>
            عرض <span className="font-semibold text-foreground">{filteredOrders.length}</span> من أصل <span className="font-semibold text-foreground">{orders.length}</span> طلب
          </div>
          <div className="font-medium text-foreground">
            إجمالي مبيعات النتائج: <span className="text-primary font-bold">{currency === "IQD" ? formatIQD(filteredTotalAmount) : formatPrice(filteredTotalAmount, currency)}</span>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-right text-muted-foreground">
                <th className="whitespace-nowrap px-5 py-3 font-medium">الطلب</th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">العميل</th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">القناة</th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">المحافظة</th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">العنوان</th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">المبلغ ({currency === "USD" ? "$" : "د.ع"})</th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">الحالة</th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">التاريخ</th>
                <th className="whitespace-nowrap px-5 py-3 font-medium text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => {
                const customerName = o.customer || "زبون"
                const amountVal = o.amount || 0
                return (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="whitespace-nowrap px-5 py-3.5 font-medium">{o.id}</td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <div className="font-semibold">{customerName}</div>
                      <div className="text-xs text-muted-foreground">{o.phone}</div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">{o.channel}</td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 font-medium text-foreground">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {o.governorate}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {o.city}
                      {o.street ? ` — ${o.street}` : ""}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-foreground">
                      {currency === "IQD" ? formatIQD(amountVal) : formatPrice(amountVal, currency)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground shadow-sm focus:border-ring outline-none cursor-pointer"
                        >
                          {orderStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <OrderStatusBadge status={o.status} />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">{o.date}</td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1 relative z-10">
                        <button
                          type="button"
                          onClick={() => setEditingOrder({ ...o, customer: customerName, amount: amountVal })}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                          title="تعديل الطلب"
                        >
                          <Edit2 className="h-4 w-4 pointer-events-none" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(o.id)}
                          className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          title="حذف الطلب"
                        >
                          <Trash2 className="h-4 w-4 pointer-events-none" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground space-y-2">
            <p className="font-medium">لا توجد طلبات مطابقة لفلاتر البحث الحالية</p>
            <button
              onClick={() => {
                setSelectedGovernorate("الكل")
                setSelectedStatus("الكل")
                setQuery("")
              }}
              className="text-xs text-primary underline"
            >
              إلغاء التصفية ورؤية كل الطلبات
            </button>
          </div>
        ) : null}
      </section>

      {editingOrder && (
        <Modal title={`تعديل الطلب ${editingOrder.id}`} onClose={() => setEditingOrder(null)}>
          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">اسم العميل</label>
              <input
                type="text"
                value={editingOrder.customer}
                onChange={(e) => setEditingOrder({ ...editingOrder, customer: e.target.value })}
                className="w-full rounded-lg border border-border bg-background p-2.5 text-sm outline-none focus:border-ring"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={editingOrder.phone}
                  onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-sm outline-none focus:border-ring"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">المبلغ (د.ع)</label>
                <input
                  type="number"
                  value={editingOrder.amount}
                  onChange={(e) => setEditingOrder({ ...editingOrder, amount: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-sm outline-none focus:border-ring"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">المحافظة</label>
                <select
                  value={editingOrder.governorate}
                  onChange={(e) => setEditingOrder({ ...editingOrder, governorate: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-sm outline-none focus:border-ring"
                >
                  {IRAQ_GOVERNORATES.map((gov) => (
                    <option key={gov.id} value={gov.name}>
                      {gov.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">المدينة / المنطقة</label>
                <input
                  type="text"
                  value={editingOrder.city}
                  onChange={(e) => setEditingOrder({ ...editingOrder, city: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-sm outline-none focus:border-ring"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">تفاصيل الشارع / العنوان</label>
              <input
                type="text"
                value={editingOrder.street || ""}
                onChange={(e) => setEditingOrder({ ...editingOrder, street: e.target.value })}
                className="w-full rounded-lg border border-border bg-background p-2.5 text-sm outline-none focus:border-ring"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                إلغاء
              </button>
              <button type="submit" className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90">
                حفظ التعديلات
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deletingId && (
        <Modal title="تأكيد حذف الطلب" onClose={() => setDeletingId(null)}>
          <div className="space-y-4 pt-2 text-center">
            <p className="text-sm text-muted-foreground">
              هل أنت تأكد من رغبتك في حذف الطلب رقم <span className="font-bold text-foreground">{deletingId}</span>؟ لا يمكن التراجع عن هذا الإجراء بعد الحذف.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-lg bg-destructive text-destructive-foreground px-4 py-2 text-sm font-medium hover:bg-destructive/90"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </Modal>
      )}

      {open ? (
        <Modal title="طلب جديد داخل العراق" onClose={() => setOpen(false)}>
          <OrderForm onDone={() => setOpen(false)} />
        </Modal>
      ) : null}
    </div>
  )
}