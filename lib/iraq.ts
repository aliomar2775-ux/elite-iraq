export const CURRENCY_CODE = "IQD"
export const CURRENCY_SYMBOL = "د.ع"
export const COUNTRY_NAME = "العراق"

// أسعار الشحن الافتراضية داخل العراق (بالدينار العراقي)
export const SHIPPING_RATES = {
  BAGHDAD: 5000,
  OTHER_GOVERNORATES: 8000,
} as const

/**
 * تنسيق المبالغ المالية بالدينار العراقي مع حماية ضد القيم غير الصالحة
 */
export function formatIQD(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0
  return `${safeAmount.toLocaleString("ar-IQ")} ${CURRENCY_SYMBOL}`
}

/**
 * حساب تكلفة الشحن تلقائياً بناءً على المحافظة
 */
export function calculateShippingCost(governorateName: string): number {
  if (!governorateName) return SHIPPING_RATES.OTHER_GOVERNORATES
  const isBaghdad = governorateName.trim().includes("بغداد")
  return isBaghdad ? SHIPPING_RATES.BAGHDAD : SHIPPING_RATES.OTHER_GOVERNORATES
}

export type Governorate = {
  id: string
  name: string
  cities: string[]
}

export const IRAQ_GOVERNORATES: Governorate[] = [
  { id: "baghdad", name: "بغداد", cities: ["الكرخ", "الرصافة", "مدينة الصدر", "الكاظمية", "الأعظمية", "الدورة"] },
  { id: "basra", name: "البصرة", cities: ["البصرة", "الزبير", "أبو الخصيب", "القرنة", "شط العرب"] },
  { id: "nineveh", name: "نينوى", cities: ["الموصل", "تلكيف", "الحمدانية", "سنجار", "تلعفر"] },
  { id: "erbil", name: "أربيل", cities: ["أربيل", "شقلاوة", "كويسنجق", "سوران", "مخمور"] },
  { id: "sulaymaniyah", name: "السليمانية", cities: ["السليمانية", "رانية", "حلبجة", "بنجوين"] },
  { id: "duhok", name: "دهوك", cities: ["دهوك", "زاخو", "عمادية", "سميل"] },
  { id: "kirkuk", name: "كركوك", cities: ["كركوك", "الحويجة", "داقوق", "دبس"] },
  { id: "anbar", name: "الأنبار", cities: ["الرمادي", "الفلوجة", "هيت", "حديثة", "القائم"] },
  { id: "saladin", name: "صلاح الدين", cities: ["تكريت", "سامراء", "بيجي", "طوزخورماتو", "بلد"] },
  { id: "diyala", name: "ديالى", cities: ["بعقوبة", "المقدادية", "خانقين", "الخالص"] },
  { id: "wasit", name: "واسط", cities: ["الكوت", "العزيزية", "النعمانية", "الصويرة"] },
  { id: "babylon", name: "بابل", cities: ["الحلة", "المسيب", "المحاويل", "الهاشمية"] },
  { id: "karbala", name: "كربلاء", cities: ["كربلاء", "الهندية", "عين التمر"] },
  { id: "najaf", name: "النجف", cities: ["النجف", "الكوفة", "المناذرة"] },
  { id: "qadisiyyah", name: "القادسية", cities: ["الديوانية", "عفك", "الشامية", "الحمزة"] },
  { id: "muthanna", name: "المثنى", cities: ["السماوة", "الرميثة", "الخضر"] },
  { id: "dhiqar", name: "ذي قار", cities: ["الناصرية", "الشطرة", "الرفاعي", "سوق الشيوخ"] },
  { id: "maysan", name: "ميسان", cities: ["العمارة", "المجر الكبير", "علي الغربي"] },
]

export function getGovernorate(nameOrId: string) {
  if (!nameOrId) return undefined
  const query = nameOrId.trim().toLowerCase()
  return IRAQ_GOVERNORATES.find(
    (g) => g.name === nameOrId.trim() || g.id.toLowerCase() === query
  )
}

export type Address = {
  governorate: string
  city: string
  district: string
  street: string
  details: string
}

export const emptyAddress = (): Address => ({
  governorate: "",
  city: "",
  district: "",
  street: "",
  details: "",
})

export function formatAddress(address: Address) {
  if (!address) return ""
  return [address.details, address.street, address.district, address.city, address.governorate, COUNTRY_NAME]
    .filter(Boolean)
    .join("، ")
}