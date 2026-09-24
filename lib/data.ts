import { formatIQD } from "@/lib/iraq"

export type Stat = {
  id?: string
  label: string
  value: string
  delta: number
  hint: string
  lowerIsBetter?: boolean // خاصية أساسية لتحديد الاتجاه الصحيح للمؤشر
}

export const overviewStats: Stat[] = [
  { id: "s1", label: "إجمالي المبيعات", value: formatIQD(0), delta: 0, hint: "مقارنة بالشهر الماضي" },
  { id: "s2", label: "الطلبات الجديدة", value: "٠", delta: 0, hint: "مقارنة بالشهر الماضي" },
  { id: "s3", label: "ردود تلقائية مُرسلة", value: "٠", delta: 0, hint: "مقارنة بالشهر الماضي" },
  { id: "s4", label: "معدل التحويل", value: "٪٠", delta: 0, hint: "مقارنة بالشهر الماضي" },
]

export type ChartPoint = { month: string; current: number; previous: number }

export const salesSeries: ChartPoint[] = [
  { month: "يناير", current: 0, previous: 0 },
  { month: "فبراير", current: 0, previous: 0 },
  { month: "مارس", current: 0, previous: 0 },
  { month: "أبريل", current: 0, previous: 0 },
  { month: "مايو", current: 0, previous: 0 },
  { month: "يونيو", current: 0, previous: 0 },
  { month: "يوليو", current: 0, previous: 0 },
  { month: "أغسطس", current: 0, previous: 0 },
  { month: "سبتمبر", current: 0, previous: 0 },
  { month: "أكتوبر", current: 0, previous: 0 },
  { month: "نوفمبر", current: 0, previous: 0 },
  { month: "ديسمبر", current: 0, previous: 0 },
]

export type Channel = "إنستغرام" | "تيك توك" | "واتساب" | "سناب شات"

export type ChannelBreakdown = { channel: Channel; share: number; sales: string }

export const channelBreakdown: ChannelBreakdown[] = [
  { channel: "إنستغرام", share: 0, sales: formatIQD(0) },
  { channel: "تيك توك", share: 0, sales: formatIQD(0) },
  { channel: "واتساب", share: 0, sales: formatIQD(0) },
  { channel: "سناب شات", share: 0, sales: formatIQD(0) },
]

export type OrderStatus = "مدفوع" | "قيد التجهيز" | "تم الشحن" | "تم التوصيل" | "ملغي" | "مسترجع"

export type Order = {
  id: string
  customer: string
  phone: string
  channel: Channel
  governorate: string
  city: string
  street: string
  items: number
  amount: number
  status: OrderStatus
  date: string
}

export const seedOrders: Order[] = []

export type ProductStatus = "منشور" | "مسودة" | "نافد"

export type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  reorderPoint: number // حد التنبيه بالمخزون المنخفض المخصص لكل منتج
  sold: number
  status: ProductStatus
  accent: string
  image?: string
}

export const seedProducts: Product[] = [
  {
    id: "p1",
    name: "ساعة Ultra الذكية إصدار 2026",
    category: "إلكترونيات",
    price: 45000,
    stock: 25,
    reorderPoint: 10,
    sold: 140,
    status: "منشور",
    accent: "blue",
  },
  {
    id: "p2",
    name: "سماعات Pro اللاسلكية عازلة للضوضاء",
    category: "إلكترونيات",
    price: 35000,
    stock: 40,
    reorderPoint: 15,
    sold: 210,
    status: "منشور",
    accent: "purple",
  },
  {
    id: "p3",
    name: "حقيبة ظهر جلدية ضد الماء",
    category: "حقائب وموضة",
    price: 28000,
    stock: 12,
    reorderPoint: 5,
    sold: 85,
    status: "منشور",
    accent: "emerald",
  },
  {
    id: "p4",
    name: "شاحن سريع بقوة 65 واط مترافق مع كابل",
    category: "إلكترونيات",
    price: 18000,
    stock: 50,
    reorderPoint: 20,
    sold: 320,
    status: "منشور",
    accent: "amber",
  },
]

export type TopProduct = { name: string; sales: string; share: number; accent: string }

export const topProducts: TopProduct[] = [
  { name: "شاحن سريع بقوة 65 واط", sales: formatIQD(5760000), share: 40, accent: "amber" },
  { name: "سماعات Pro اللاسلكية", sales: formatIQD(7350000), share: 30, accent: "purple" },
  { name: "ساعة Ultra الذكية", sales: formatIQD(6300000), share: 30, accent: "blue" },
]

export type Activity = { id?: string; who: string; action: string; when: string; channel?: Channel }

export const activity: Activity[] = []

export type ReplyRule = {
  id: string
  trigger: string
  keywords: string
  reply: string
  hits: number
  enabled: boolean
}

export const seedReplyRules: ReplyRule[] = [
  { id: "r1", trigger: "الاستفسار عن السعر", keywords: "كم السعر، بكم، السعر، شكد", reply: "أهلاً بك! الأسعار موضحة بالدينار العراقي، ويمكنك الاستفسار عن أي منتج محدد.", hits: 0, enabled: true },
  { id: "r2", trigger: "الاستفسار عن التوصيل", keywords: "التوصيل، الشحن، متى يوصل، شكد التوصيل", reply: "التوصيل لبغداد 5,000 د.ع وباقي المحافظات 8,000 د.ع. يوصل الطلب خلال 24 إلى 48 ساعة.", hits: 0, enabled: true },
  { id: "r3", trigger: "توفر المنتج", keywords: "متوفر، موجود، المقاسات، الكمية", reply: "نعم! المنتجات المعروضة متوفرة حالياً ويمكنك طلبها فوراً.", hits: 0, enabled: true },
]

export type ChatMessage = { id?: string; from: "customer" | "bot"; text: string; time: string }

export const conversation: ChatMessage[] = []

export const chatbotStats: Stat[] = [
  { id: "cs1", label: "رسائل تمت معالجتها", value: "٠", delta: 0, hint: "هذا الشهر" },
  { id: "cs2", label: "نسبة الرد الآلي", value: "٪٠", delta: 0, hint: "من إجمالي الرسائل" },
  { id: "cs3", label: "متوسط زمن الرد", value: "٠ ثوانٍ", delta: -15, hint: "أسرع من السابق", lowerIsBetter: true },
  { id: "cs4", label: "محادثات نشطة", value: "٠", delta: 0, hint: "خلال ٢٤ ساعة" },
]

export type Invoice = {
  id: string
  plan: string
  date: string
  amount: string
  status: "مدفوعة" | "مستحقة"
}

export const invoices: Invoice[] = []

export type UsageMetric = { label: string; used: number; total: number; unit: string }

export const planUsage: UsageMetric[] = [
  { label: "الطلبات هذا الشهر", used: 0, total: 500, unit: "طلب" },
  { label: "الردود التلقائية", used: 0, total: 5000, unit: "رسالة" },
  { label: "المنتجات المنشورة", used: 0, total: 50, unit: "منتج" },
  { label: "أعضاء الفريق", used: 0, total: 3, unit: "عضو" },
]

export type MerchantProfile = {
  name: string
  storeName: string
  phone: string
  activePlanId: string
  aiModel: "gemini-2.5-flash" | "gemini-2.5-pro"
  aiTokensUsed: number
  aiTokenLimit: number
  currency: "IQD" | "USD"
}

export type PlanType = {
  id: string
  name: string
  price: number
  tagline: string
  features: string[]
  aiModel: "gemini-2.5-flash" | "gemini-2.5-pro"
  monthlyTokenLimit: number
  current: boolean
}

export const plans: PlanType[] = [
  {
    id: "starter",
    name: "البداية",
    price: 15_000,
    tagline: "للمتاجر الناشئة",
    features: ["حتى ٥٠٠ طلب شهرياً", "قناة مبيعات واحدة", "ردود تلقائية أساسية (Flash)", "دعم عبر البريد"],
    aiModel: "gemini-2.5-flash",
    monthlyTokenLimit: 500_000,
    current: false,
  },
  {
    id: "growth",
    name: "النمو",
    price: 50_000,
    tagline: "الأكثر اختياراً",
    features: ["حتى ٢٠٠٠ طلب شهرياً", "جميع قنوات التواصل", "ردود ذكية متطورة (Flash)", "تقارير متقدمة ودعم مباشر"],
    aiModel: "gemini-2.5-flash",
    monthlyTokenLimit: 2_000_000,
    current: true,
  },
  {
    id: "pro",
    name: "الاحتراف",
    price: 100_000,
    tagline: "للعلامات الكبيرة",
    features: ["طلبات غير محدودة", "فريق حتى ٢٠ عضواً", "نموذج Pro المتقدم للإقناع", "مدير حساب مخصص وأولوية"],
    aiModel: "gemini-2.5-pro",
    monthlyTokenLimit: 10_000_000,
    current: false,
  },
]

// دالة مرنة لإنشاء سياق متجر حديث وديناميكي للذكاء الاصطناعي
export function getStoreKnowledgeContext(
  products: Product[] = seedProducts,
  rules: ReplyRule[] = seedReplyRules
): string {
  const productsList = products
    .filter((p) => p.status === "منشور")
    .map((p) => {
      const reorderThreshold = p.reorderPoint ?? 10
      const isLowStock = p.stock > 0 && p.stock <= reorderThreshold
      const stockStatus = p.stock === 0 ? "نافد" : isLowStock ? `منخفض جداً (${p.stock})` : `متوفر (${p.stock})`
      return `- اسم المنتج: ${p.name} | السعر: ${formatIQD(p.price)} | التصنيف: ${p.category} | حالة المخزون: ${stockStatus}`
    })
    .join("\n")

  const rulesList = rules
    .filter((r) => r.enabled)
    .map((r) => `- قاعدة (${r.trigger}): عند الاستفسار بـ (${r.keywords})، الرد الموجه: "${r.reply}"`)
    .join("\n")

  return `
قائمة المنتجات الحالية المتاحة في المتجر:
${productsList || "لا توجد منتجات متوفرة حالياً."}

قواعد الردود المحددة مسبقاً:
${rulesList || "لا توجد قواعد سريعة محددة."}
`
}