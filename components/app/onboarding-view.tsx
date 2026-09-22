"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Store } from "lucide-react"
import { AddressForm } from "@/components/app/address-form"
import { useApp } from "@/lib/app-state"
import { emptyAddress } from "@/lib/iraq"

export function OnboardingView() {
  const { user, completeOnboarding } = useApp()
  const router = useRouter()
  const [storeName, setStoreName] = useState("")
  const [slug, setSlug] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState(emptyAddress())

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    completeOnboarding({ storeName, slug, phone, address })
    router.replace("/channels")
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Store className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight">إعداد متجرك العراقي</h1>
          <p className="text-sm text-muted-foreground">مرحباً {user?.name} — العملة الافتراضية هي الدينار العراقي (IQD)</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">اسم المتجر</span>
            <input
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none focus:border-ring focus:bg-background"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">المعرّف (slug)</span>
            <input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="lamsa"
              className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none focus:border-ring focus:bg-background"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block text-muted-foreground">رقم الجوال العراقي</span>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XXXXXXXXX"
              className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none focus:border-ring focus:bg-background"
            />
          </label>
        </div>

        <div>
          <h2 className="mb-3 font-semibold">عنوان المتجر / الاستلام</h2>
          <AddressForm value={address} onChange={setAddress} />
        </div>

        <button type="submit" className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90">
          حفظ المتجر والانتقال لربط القنوات
        </button>
      </form>
    </div>
  )
}
