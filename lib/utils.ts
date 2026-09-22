import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// دالة تحويل العملة وعرضها بالشكل الصحيح
export function formatPrice(priceInIQD: number | string, currency: string) {
  // تحويل النص إلى رقم في حال كان السعر محفوظاً كنص
  const price = typeof priceInIQD === "string" ? parseFloat(priceInIQD) : priceInIQD;
  
  if (isNaN(price)) return "0";

  const exchangeRate = 1520; // سعر الصرف (يمكنك تغييره حسب السوق)
  
  if (currency === "USD") {
    const priceInUSD = price / exchangeRate;
    // عرض السعر بالدولار مع تقريب لرقمين عشريين
    return `$${priceInUSD.toFixed(2)}`; 
  }
  
  // عرض السعر بالدينار مع الفواصل (مثل 5,000)
  return `${price.toLocaleString("en-US")} د.ع`;
}