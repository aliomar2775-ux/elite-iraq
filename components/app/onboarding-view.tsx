"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Store, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { AddressForm } from "@/components/app/address-form"
import { useApp } from "@/lib/app-state"
import { emptyAddress } from "@/lib/iraq"

function isValidIraqiPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "")
  const iraqiRegex = /^(0)?(77|78|79|75)\d{8}$/
  return iraqiRegex.test(cleanPhone)
}

export function OnboardingView() {
  const { user, completeOnboarding } = useApp()
  const router = useRouter()

  const [storeName, setStoreName] = useState("")
  const [slug, setSlug] = useState("")
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState(emptyAddress())

  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  // توليد المعرّف (Slug) تلقائياً من اسم المتجر ما لم يُعدله التاجر يدوياً
  const handleStoreNameChange = (name: string) => {
    setStoreName(name)
    if (!isSlugManuallyEdited) {
      const autoSlug = name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
      setSlug(autoSlug)
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!storeName.trim()) {
      setError("يرجى إدخال اسم المتجر")
      return
    }

    if (!slug.trim()) {
      setError("يرجى تحديد المعرّف (Slug) الخاص بالمتجر")
      return
    }

    if (!isValidIraqiPhone(phone)) {
      setError("يرجى إدخال رقم هاتف عراقي صحيح (يبدأ بـ 077, 078, 079, 075)")
      return
    }

    if (!address.governorate || !address.city || !address.street) {
      setError("يرجى إكمال تفاصيل العنوان الرئيسية (المحافظة، المدينة، والشارع/النقطة الدالة)")
      return
    }

    setPending(true)
    try {
      completeOnboarding({ storeName: storeName.trim(), slug: slug.trim(), phone: phone.trim(), address })
      router.replace("/channels")
    } catch {
      setError("حدث خطأ أثناء حفظ البيانات، يرجى المحاولة مرة أخرى")
      setPending(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm rtl">
      <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow-sm">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">إعداد متجرك العراقي</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              مرحباً {user?.name || "عزيزي التاجر"} — العملة الافتراضية هي الدينار العراقي (IQD)
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-xs font-medium">
            <span className="mb-1.5 block text-muted-foreground">اسم المتجر *</span>
            <input
              required
              value={storeName}
              onChange={(e) => handleStoreNameChange(e.target.value)}
              placeholder="مثال: متجر لمسة العصر"
              className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none transition-colors focus:border-ring focus:bg-background text-foreground"
            />
          </label>

          <label className="block text-xs font-medium">
            <span className="mb-1.5 block text-muted-foreground">معرّف المتجر بالرابط (Slug) *</span>
            <input
              required
              value={slug}
              onChange={(e) => {
                setIsSlugManuallyEdited(true)
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }}
              placeholder="lamsa"
              className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm font-mono outline-none transition-colors focus:border-ring focus:bg-background text-foreground"
            />
            <span className="mt-1 block text-[10px] text-muted-foreground font-mono">
              رابط المتجر: elite.iq/<strong className="text-primary">{slug || "lamsa"}</strong>
            </span>
          </label>

          <label className="block text-xs font-medium sm:col-span-2">
            <span className="mb-1.5 block text-muted-foreground">رقم الجوال العراقي (للواتساب والإشعارات) *</span>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XXXXXXXXX"
              className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm font-mono outline-none transition-colors focus:border-ring focus:bg-background text-foreground"
            />
          </label>
        </div>

        <div className="border-t border-border/60 pt-4">
          <h2 className="mb-3 text-sm font-bold text-foreground">عنوان المتجر / نقطة الانطلاق للتوصيل</h2>
          <AddressForm value={address} onChange={setAddress} />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-lg bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>جارٍ حفظ بيانات المتجر...</span>
            </>
          ) : (
            <>
              <span>حفظ المتجر والانتقال لربط القنوات</span>
              <ArrowLeft className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}