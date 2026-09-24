"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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

  // دالة موحدة لتنسيق المبالغ المالي
  const renderMoney = useCallback(
    (amount: number) => {
      return currency === "IQD" ? formatIQD(amount) : formatPrice(amount, currency)
    },
    [currency]
  )

  // الاستماع الفوري لحدث التصفية القادم من شريط البحث العلوي (Topbar)
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
  const summary = useMemo(
    () => [
      { label: "قيد التجهيز", value: orders.filter((o) => o.status === "قيد التجهيز").length, icon: Clock, tint: "text-amber-500 bg-amber-500/15" },
      { label: "قيد الشحن", value: orders.filter((o) => o.status === "تم الشحن").length, icon: Truck, tint: "text-primary bg-primary/15" },
      { label: "تم التوصيل", value: orders.filter((o) => o.status === "تم التوصيل").length, icon: PackageCheck, tint: "text-emerald-500 bg-emerald-500/15" },
      { label: "مرتجعات", value: orders.filter((o) => o.status === "مسترجع").length, icon: RotateCcw, tint: "text-destructive bg-destructive/15" },
    ],
    [orders]
  )

  // تصفية الطلبات بمرونة عربية
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
    <div className="space-y-6 rtl text-foreground">
      {onCreate ? (
        <div className="flex justify-end">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            طلب جديد
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg shrink-0", s.tint)}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight font-mono">{s.value.toLocaleString("ar-IQ")}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground">تصفية الطلبات</h3>
          </div>
          {(selectedGovernorate !== "الكل" || selectedStatus !== "الكل" || query) && (
            <button
              onClick={() => {
                setSelectedGovernorate("الكل")
                setSelectedStatus("الكل")
                setQuery("")
              }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline cursor-pointer"
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
              className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-xs outline-none focus:border-primary focus:bg-background transition-colors cursor-pointer text-foreground"
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
              className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-xs outline-none focus:border-primary focus:bg-background transition-colors cursor-pointer text-foreground"
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
                className="h-10 w-full rounded-lg border border-border bg-muted/30 pr-10 pl-8 text-xs outline-none placeholder:text-muted-foreground focus:border-primary focus:bg-background transition-colors text-foreground"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
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
            <span>
              عرض نتائج البحث عن: <strong>"{query}"</strong>
            </span>
            <button onClick={() => setQuery("")} className="underline font-bold hover:text-emerald-400 cursor-pointer">
              إظهار كافة الطلبات
            </button>
          </div>
        )}

        {/* إجمالي المبيعات بالعملة الديناميكية */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <div>
            عرض <span className="font-bold text-foreground font-mono">{filteredOrders.length}</span> من أصل{" "}
            <span className="font-bold text-foreground font-mono">{orders.length}</span> طلب
          </div>
          <div className="font-medium text-foreground">
            إجمالي مبيعات النتائج: <span className="text-primary font-mono font-bold">{renderMoney(filteredTotalAmount)}</span>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-right text-muted-foreground">
                <th className="whitespace-nowrap px-4 py-3 font-semibold">الطلب</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">العميل</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">القناة</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">المحافظة</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">العنوان</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">المبلغ ({currency === "USD" ? "$" : "د.ع"})</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">الحالة</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">التاريخ</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => {
                const customerName = o.customer || "زبون"
                const amountVal = o.amount || 0
                return (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-foreground">{o.id}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="font-bold text-foreground">{customerName}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">{o.phone}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{o.channel}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        {o.governorate}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                      {o.city}
                      {o.street ? ` — ${o.street}` : ""}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-foreground">
                      {renderMoney(amountVal)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground shadow-xs focus:border-primary outline-none cursor-pointer"
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
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground font-mono">{o.date}</td>
                    <td className="whitespace-nowrap px-4 py-3">
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
          <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
            <p className="font-medium">لا توجد طلبات مطابقة لفلاتر البحث الحالية</p>
            <button
              onClick={() => {
                setSelectedGovernorate("الكل")
                setSelectedStatus("الكل")
                setQuery("")
              }}
              className="text-xs text-primary underline cursor-pointer"
            >
              إلغاء التصفية ورؤية كل الطلبات
            </button>
          </div>
        ) : null}
      </section>

      {/* مودال تعديل الطلب */}
      {editingOrder && (
        <Modal title={`تعديل الطلب ${editingOrder.id}`} onClose={() => setEditingOrder(null)}>
          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2 text-xs">
            <div>
              <label className="block font-medium text-muted-foreground mb-1">اسم العميل</label>
              <input
                type="text"
                value={editingOrder.customer}
                onChange={(e) => setEditingOrder({ ...editingOrder, customer: e.target.value })}
                className="w-full rounded-lg border border-border bg-background p-2.5 text-xs outline-none focus:border-primary text-foreground"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-muted-foreground mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={editingOrder.phone}
                  onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs font-mono outline-none focus:border-primary text-foreground"
                />
              </div>
              <div>
                <label className="block font-medium text-muted-foreground mb-1">
                  المبلغ ({currency === "IQD" ? "د.ع" : "$"})
                </label>
                <input
                  type="number"
                  value={editingOrder.amount}
                  onChange={(e) => setEditingOrder({ ...editingOrder, amount: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs font-mono outline-none focus:border-primary text-foreground"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-muted-foreground mb-1">المحافظة</label>
                <select
                  value={editingOrder.governorate}
                  onChange={(e) => setEditingOrder({ ...editingOrder, governorate: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs outline-none focus:border-primary cursor-pointer text-foreground"
                >
                  {IRAQ_GOVERNORATES.map((gov) => (
                    <option key={gov.id} value={gov.name}>
                      {gov.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-muted-foreground mb-1">المدينة / المنطقة</label>
                <input
                  type="text"
                  value={editingOrder.city}
                  onChange={(e) => setEditingOrder({ ...editingOrder, city: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium text-muted-foreground mb-1">تفاصيل الشارع / العنوان</label>
              <input
                type="text"
                value={editingOrder.street || ""}
                onChange={(e) => setEditingOrder({ ...editingOrder, street: e.target.value })}
                className="w-full rounded-lg border border-border bg-background p-2.5 text-xs outline-none focus:border-primary text-foreground"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-bold hover:opacity-90 cursor-pointer"
              >
                حفظ التعديلات
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* مودال تأكيد الحذف */}
      {deletingId && (
        <Modal title="تأكيد حذف الطلب" onClose={() => setDeletingId(null)}>
          <div className="space-y-4 pt-2 text-center text-xs">
            <p className="text-muted-foreground leading-relaxed">
              هل أنت تأكد من رغبتك في حذف الطلب رقم <span className="font-bold font-mono text-foreground">{deletingId}</span>؟ لا يمكن التراجع عن هذا الإجراء بعد الحذف.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-lg bg-destructive text-destructive-foreground px-4 py-2 font-bold hover:opacity-90 cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* مودال إنشاء طلب جديد */}
      {open ? (
        <Modal title="طلب جديد داخل العراق" onClose={() => setOpen(false)}>
          <OrderForm onDone={() => setOpen(false)} />
        </Modal>
      ) : null}
    </div>
  )
}