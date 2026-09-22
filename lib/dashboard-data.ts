export const dict = {
  ar: {
    // القائمة الجانبية (Sidebar)
    overview: "نظرة عامة",
    products: "المنتجات والمخزون",
    orders: "الطلبات والشحن",
    channels: "ربط المتجر",
    chatbot: "الردود التلقائية",
    billing: "الفوترة والاشتراك",
    settings: "الإعدادات",
    support: "الدعم",
    general: "عام",
    
    // الشريط العلوي وعامة المنصة
    searchPlaceholder: "ابحث عن منتج أو طلب أو عميل...",
    connectedChannels: "قنوات مربوطة",
    saveChanges: "حفظ التغييرات",
    
    // صفحة المنتجات
    productsTitle: "المنتجات والمخزون",
    productsSubtitle: "أسعار المنتجات بالدينار العراقي عبر كل القنوات المربوطة",
    newProduct: "منتج جديد",
    totalProducts: "إجمالي المنتجات",
    publishedProducts: "منتجات منشورة",
    lowStock: "مخزون منخفض",
    outOfStock: "نفد من المخزون",
  },
  en: {
    // Sidebar
    overview: "Overview",
    products: "Products & Inventory",
    orders: "Orders & Shipping",
    channels: "Store Connections",
    chatbot: "Auto Replies",
    billing: "Billing & Subscription",
    settings: "Settings",
    support: "Support",
    general: "General",
    
    // Topbar & Global
    searchPlaceholder: "Search for a product, order, or customer...",
    connectedChannels: "Connected channels",
    saveChanges: "Save Changes",
    
    // Products Page
    productsTitle: "Products & Inventory",
    productsSubtitle: "Product prices across all connected channels",
    newProduct: "New Product",
    totalProducts: "Total Products",
    publishedProducts: "Published Products",
    lowStock: "Low Stock",
    outOfStock: "Out of Stock",
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