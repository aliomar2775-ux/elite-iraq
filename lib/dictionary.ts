export const dict = {
  ar: {
    overview: "نظرة عامة",
    products: "المنتجات والمخزون",
    orders: "الطلبات والشحن",
    settings: "الإعدادات",
    support: "الدعم",
    searchPlaceholder: "ابحث عن منتج أو طلب أو عميل...",
    connectedChannels: "قنوات مربوطة",
    saveChanges: "حفظ التغييرات",
    storeSettings: "بيانات المتجر والتواصل",
    storeName: "اسم المتجر",
    phone: "رقم الجوال",
    shippingPrices: "أسعار التوصيل الافتراضية",
    baghdadDelivery: "توصيل بغداد",
    otherGovDelivery: "توصيل باقية المحافظات",
  },
  en: {
    overview: "Overview",
    products: "Products & Inventory",
    orders: "Orders & Shipping",
    settings: "Settings",
    support: "Support",
    searchPlaceholder: "Search for a product, order, or customer...",
    connectedChannels: "Connected channels",
    saveChanges: "Save Changes",
    storeSettings: "Store & Contact Details",
    storeName: "Store Name",
    phone: "Phone Number",
    shippingPrices: "Default Shipping Prices",
    baghdadDelivery: "Baghdad Delivery",
    otherGovDelivery: "Other Governorates Delivery",
  },
}

export function useTranslation(lang: string) {
  const currentLang = lang === "en" ? "en" : "ar"
  return {
    t: (key: keyof typeof dict.ar) => {
      return dict[currentLang][key] || dict.ar[key]
    },
  }
}