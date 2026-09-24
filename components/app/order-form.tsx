"use client"

import { useMemo, useState } from "react"
import { AddressForm } from "@/components/app/address-form"
import { useApp } from "@/lib/app-state"
import { emptyAddress, formatIQD } from "@/lib/iraq"
import { type Channel, type OrderStatus } from "@/lib/data"
import { formatPrice } from "@/lib/utils"
import { Calculator, AlertCircle } from "lucide-react"

export function OrderForm({ onDone }: { onDone: () => void }) {
  const { products, channels, addOrder, currency } = useApp()
  const connected = useMemo(() => channels.filter((c) => c.connected), [channels])

  const [customer, setCustomer] = useState("")
  const [phone, setPhone] = useState("")
  const [channel, setChannel] = useState<Channel>(connected[0]?.name ?? "واتساب")
  const [productId, setProductId] = useState(products[0]?.id ?? "")
  const [items, setItems] = useState(1)
  const [status, setStatus] = useState<OrderStatus>("قيد التجهيز")
  const [address, setAddress] = useState(emptyAddress())
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const product = useMemo(() => products.find((p) => p.id === productId), [productId, products])

  const totalAmount = useMemo(() => {
    if (!product) return 0
    return product.price * items
  }, [product, items])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!product) {
      setErrorMsg("يرجى اختيار منتج لإنشاء الطلب.")
      return
    }

    if (!customer.trim()) {
      setErrorMsg("يرجى إدخال اسم العميل.")
      return
    }

    if (!address.governorate || !address.city) {
      setErrorMsg("يرجى إكمال تفاصيل عنوان التوصيل (المحافظة والمدينة).")
      return
    }

    addOrder({
      customer: customer.trim(),
      phone: phone.trim(),
      channel,
      governorate: address.governorate,
      city: address.city,
      street: [address.street, address.district].filter(Boolean).join(" — "),
      items,
      amount: totalAmount,
      status,
    })

    onDone()
  }

  return (
    <form className="space-y-4 rtl" onSubmit={handleSubmit}>
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">اسم العميل *</span>
          <input
            required
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="مثال: أحمد الدليمي"
            className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none focus:border-ring focus:bg-background transition-colors"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">رقم الهاتف *</span>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XXXXXXXXX"
            className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm font-mono outline-none focus:border-ring focus:bg-background transition-colors"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">قناة البيع</span>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as Channel)}
            className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none focus:border-ring focus:bg-background transition-colors cursor-pointer"
          >
            {(connected.length ? connected.map((c) => c.name) : (["إنستغرام", "تيك توك", "واتساب", "سناب شات"] as Channel[])).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">حالة الطلب الأولية</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none focus:border-ring focus:bg-background transition-colors cursor-pointer"
          >
            <option value="قيد التجهيز">قيد التجهيز</option>
            <option value="تم الشحن">تم الشحن</option>
            <option value="مدفوع">مدفوع</option>
            <option value="تم التوصيل">تم التوصيل</option>
          </select>
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">المنتج المطلوب *</span>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none focus:border-ring focus:bg-background transition-colors cursor-pointer"
          >
            {products.length === 0 ? (
              <option value="">لا توجد منتجات متاحة</option>
            ) : (
              products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ({currency === "IQD" ? formatIQD(p.price) : formatPrice(p.price, currency)})
                </option>
              ))
            )}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">الكمية</span>
          <input
            type="number"
            min={1}
            value={items}
            onChange={(e) => setItems(Math.max(1, Number(e.target.value)))}
            className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm font-mono outline-none focus:border-ring focus:bg-background transition-colors"
          />
        </label>
      </div>

      <div className="pt-2 border-t border-border/60">
        <h3 className="text-sm font-semibold mb-3">عنوان التوصيل داخل العراق</h3>
        <AddressForm value={address} onChange={setAddress} />
      </div>

      {/* بطاقة معاينة الحساب المالي الإجمالي */}
      {product && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-foreground">معاينة الإجمالي الحسابي</p>
              <p className="text-muted-foreground text-[11px]">
                {items} قطعة × {currency === "IQD" ? formatIQD(product.price) : formatPrice(product.price, currency)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-bold text-primary">
              {currency === "IQD" ? formatIQD(totalAmount) : formatPrice(totalAmount, currency)}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <button
          type="button"
          onClick={onDone}
          className="h-10 rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted transition-colors"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={!product}
          className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          إنشاء الطلب
        </button>
      </div>
    </form>
  )
}