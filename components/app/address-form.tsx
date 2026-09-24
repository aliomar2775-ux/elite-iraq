"use client"

import { useMemo } from "react"
import { getGovernorate, IRAQ_GOVERNORATES, type Address } from "@/lib/iraq"
import { cn } from "@/lib/utils"

const fieldClass =
  "h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none transition-colors focus:border-ring focus:bg-background disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"

const inputFieldClass =
  "h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none transition-colors focus:border-ring focus:bg-background"

export function AddressForm({
  value,
  onChange,
  className,
}: {
  value: Address
  onChange: (next: Address) => void
  className?: string
}) {
  const currentGov = value?.governorate || ""
  const currentCity = value?.city || ""
  const currentDistrict = value?.district || ""
  const currentStreet = value?.street || ""
  const currentDetails = value?.details || ""

  // حساب مصفوفة مدن المحافظة المختارة مع التخزين المؤقت
  const cities = useMemo(() => {
    if (!currentGov) return []
    return getGovernorate(currentGov)?.cities ?? []
  }, [currentGov])

  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 rtl", className)}>
      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">المحافظة *</span>
        <select
          value={currentGov}
          onChange={(e) => onChange({ ...value, governorate: e.target.value, city: "" })}
          className={fieldClass}
          required
        >
          <option value="">اختر محافظة عراقية</option>
          {IRAQ_GOVERNORATES.map((g) => (
            <option key={g.id} value={g.name}>
              {g.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">المدينة / القضاء *</span>
        <select
          value={currentCity}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
          className={fieldClass}
          required
          disabled={!currentGov}
        >
          <option value="">{currentGov ? "اختر المدينة" : "اختر المحافظة أولاً"}</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">الحي / المنطقة</span>
        <input
          value={currentDistrict}
          onChange={(e) => onChange({ ...value, district: e.target.value })}
          placeholder="مثال: المنصور، الكرادة، الجزائر..."
          className={inputFieldClass}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">الشارع / النقطة الدالة *</span>
        <input
          value={currentStreet}
          onChange={(e) => onChange({ ...value, street: e.target.value })}
          placeholder="اسم الشارع أو أقرب نقطة دالة"
          className={inputFieldClass}
          required
        />
      </label>

      <label className="block text-sm sm:col-span-2">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">تفاصيل إضافية للعنوان</span>
        <textarea
          value={currentDetails}
          onChange={(e) => onChange({ ...value, details: e.target.value })}
          placeholder="رقم الدار، الطابق، ملاحظات خاصة لمندوب التوصيل..."
          rows={3}
          className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:bg-background"
        />
      </label>
    </div>
  )
}