import { formatIQD } from "@/lib/iraq"

export type Stat = {
  label: string
  value: string
  delta: number
  hint: string
}

export const overviewStats: Stat[] = [
  { label: "إجمالي المبيعات", value: formatIQD(0), delta: 0, hint: "مقارنة بالشهر الماضي" },
  { label: "الطلبات الجديدة", value: "٠", delta: 0, hint: "مقارنة بالشهر الماضي" },
  { label: "ردود تلقائية مُرسلة", value: "٠", delta: 0, hint: "مقارنة بالشهر الماضي" },
  { label: "معدل التحويل", value: "٪٠", delta: 0, hint: "مقارنة بالشهر الماضي" },
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

export type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  sold: number
  status: "منشور" | "مسودة" | "نافد"
  accent: string
  image?: string
}

// تزويد المنتجات ببيانات أولية ليتغذى عليها الذكاء الاصطناعي (RAG)
export const seedProducts: Product[] = [
  {
    id: "p1",
    name: "ساعة Ultra الذكية إصدار 2026",
    category: "إلكترونيات",
    price: 45000,
    stock: 25,
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

export type Activity = { who: string; action: string; when: string; channel?: Channel }

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

export type ChatMessage = { from: "customer" | "bot"; text: string; time: string }

export const conversation: ChatMessage[] = []

export const chatbotStats: Stat[] = [
  { label: "رسائل تمت معالجتها", value: "٠", delta: 0, hint: "هذا الشهر" },
  { label: "نسبة الرد الآلي", value: "٪٠", delta: 0, hint: "من إجمالي الرسائل" },
  { label: "متوسط زمن الرد", value: "٠ ثوانٍ", delta: 0, hint: "أسرع من السابق" },
  { label: "محادثات نشطة", value: "٠", delta: 0, hint: "خلال ٢٤ ساعة" },
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

/**
 * دالة مساعدة لاستخراج كتالوج المنتجات والقواعد وتغذية الذكاء الاصطناعي بها تلقائياً (RAG Context)
 */
export function getStoreKnowledgeContext(): string {
  const productsList = seedProducts
    .filter((p) => p.status === "منشور")
    .map((p) => `- اسم المنتج: ${p.name} | السعر: ${formatIQD(p.price)} | الحالة: ${p.stock > 0 ? "متوفر" : "نافد"} (المخزون: ${p.stock})`)
    .join("\n")

  const rulesList = seedReplyRules
    .filter((r) => r.enabled)
    .map((r) => `- قاعدة (${r.trigger}): عند الاستفسار بـ (${r.keywords})، الرد الموجه: "${r.reply}"`)
    .join("\n")

  return `
قائمة المنتجات الحالية المتاحة في المتجر:
${productsList || "لا توجد منتجات حالياً."}

قواعد الردود المحددة مسبقاً:
${rulesList}
`
}