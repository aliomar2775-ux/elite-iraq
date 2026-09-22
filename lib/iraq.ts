export const CURRENCY_CODE = "IQD"
export const CURRENCY_SYMBOL = "د.ع"
export const COUNTRY_NAME = "العراق"

export function formatIQD(amount: number) {
  return `${amount.toLocaleString("ar-IQ")} ${CURRENCY_SYMBOL}`
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

export function getGovernorate(name: string) {
  return IRAQ_GOVERNORATES.find((g) => g.name === name)
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
  return [address.street, address.district, address.city, address.governorate, COUNTRY_NAME]
    .filter(Boolean)
    .join("، ")
}
