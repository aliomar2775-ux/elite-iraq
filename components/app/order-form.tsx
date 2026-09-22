"use client"

import { useMemo, useState } from "react"
import { AddressForm } from "@/components/app/address-form"
import { useApp } from "@/lib/app-state"
import { emptyAddress } from "@/lib/iraq"
import { type Channel } from "@/lib/data"

export function OrderForm({ onDone }: { onDone: () => void }) {
  const { products, channels, addOrder } = useApp()
  const connected = channels.filter((c) => c.connected)
  const [customer, setCustomer] = useState("")
  const [phone, setPhone] = useState("")
  const [channel, setChannel] = useState<Channel>(connected[0]?.name ?? "واتساب")
  const [productId, setProductId] = useState(products[0]?.id ?? "")
  const [items, setItems] = useState(1)
  const [address, setAddress] = useState(emptyAddress())

  const product = useMemo(() => products.find((p) => p.id === productId), [productId, products])

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!product) return
        addOrder({
          customer,
          phone,
          channel,
          governorate: address.governorate,
          city: address.city,
          street: [address.street, address.district].filter(Boolean).join(" — "),
          items,
          amount: product.price * items,
          status: "مدفوع",
        })
        onDone()
      }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">اسم العميل</span>
          <input required value={customer} onChange={(e) => setCustomer(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none focus:border-ring" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">رقم الجوال</span>
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXXX" className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none focus:border-ring" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">القناة</span>
          <select value={channel} onChange={(e) => setChannel(e.target.value as Channel)} className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm">
            {(connected.length ? connected.map((c) => c.name) : (["إنستغرام", "تيك توك", "واتساب", "سناب شات"] as Channel[])).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">المنتج</span>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm">
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">الكمية</span>
          <input type="number" min={1} value={items} onChange={(e) => setItems(Number(e.target.value))} className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm" />
        </label>
      </div>
      <h3 className="font-semibold">عنوان التوصيل داخل العراق</h3>
      <AddressForm value={address} onChange={setAddress} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="h-10 rounded-lg border border-border px-4 text-sm">
          إلغاء
        </button>
        <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
          إنشاء الطلب
        </button>
      </div>
    </form>
  )
}
