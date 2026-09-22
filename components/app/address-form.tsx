"use client"

import { getGovernorate, IRAQ_GOVERNORATES, type Address } from "@/lib/iraq"
import { cn } from "@/lib/utils"

const fieldClass =
  "h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none transition-colors focus:border-ring focus:bg-background"

export function AddressForm({
  value,
  onChange,
  className,
}: {
  value: Address
  onChange: (next: Address) => void
  className?: string
}) {
  const cities = getGovernorate(value.governorate)?.cities ?? []

  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">المحافظة</span>
        <select
          value={value.governorate}
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
        <span className="mb-1.5 block text-muted-foreground">المدينة / القضاء</span>
        <select
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
          className={fieldClass}
          required
          disabled={!value.governorate}
        >
          <option value="">{value.governorate ? "اختر المدينة" : "اختر المحافظة أولاً"}</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">الحي</span>
        <input
          value={value.district}
          onChange={(e) => onChange({ ...value, district: e.target.value })}
          placeholder="مثال: المنصور"
          className={fieldClass}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">الشارع</span>
        <input
          value={value.street}
          onChange={(e) => onChange({ ...value, street: e.target.value })}
          placeholder="اسم الشارع أو أقرب نقطة دالة"
          className={fieldClass}
          required
        />
      </label>

      <label className="block text-sm sm:col-span-2">
        <span className="mb-1.5 block text-muted-foreground">تفاصيل إضافية</span>
        <textarea
          value={value.details}
          onChange={(e) => onChange({ ...value, details: e.target.value })}
          placeholder="رقم الدار، الطابق، ملاحظات للمندوب"
          rows={3}
          className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-ring focus:bg-background"
        />
      </label>
    </div>
  )
}
