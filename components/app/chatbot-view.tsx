"use client"

import { useState, useRef, useEffect } from "react"
import {
  Bot,
  User,
  Send,
  Plus,
  Trash2,
  Zap,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Power,
  Mic,
  FileText,
  Truck,
  Play,
  Lightbulb,
  RefreshCw,
  ExternalLink,
  AtSign,
  MapPin,
  Ban,
  Check,
  Bell,
  Search,
  AlertTriangle,
  Sparkles,
  X,
  History,
  Loader2,
} from "lucide-react"
import { chatbotStats } from "@/lib/data"
import { StatCards } from "@/components/app/stat-cards"
import { Modal } from "@/components/app/modal"
import { useApp } from "@/lib/app-state"
import { cn } from "@/lib/utils"

// 🇮🇶 قائمة المحافظات العراقية كاملة
const IRAQ_GOVERNORATES = [
  "بغداد",
  "البصرة",
  "أربيل",
  "النجف",
  "كربلاء",
  "نينوى (الموصل)",
  "ديالى",
  "بابل",
  "الأنبار",
  "صلاح الدين",
  "واسط",
  "ذي قار",
  "ميسان",
  "القادسية (الديوانية)",
  "المثنى",
  "السليمانية",
  "دهوك",
  "كركوك",
]

interface CustomerProfile {
  completedOrders: number
  returnedOrders: number
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
}

interface Message {
  id: string
  sender: "customer" | "bot" | "merchant" | "system"
  text: string
  time: string
  timestamp?: number
  type?: "text" | "voice"
  audioDuration?: string
  isTranscribed?: boolean
}

// 🚚 هيكل أسعار الشحن المخصصة مع دعم الاختيار المتعدد بالمصفوفة
interface DeliveryRates {
  homeGovName: string      // اسم محافظة المتجر
  homeGovFee: number       // سعر التوصيل داخل محافظة المتجر
  baghdadFee: number       // سعر التوصيل إلى بغداد
  nearGovs: string[]       // 🎯 مصفوفة أسماء المحافظات القريبة المحددة بالنقر
  nearGovsFee: number      // سعر التوصيل للمحافظات القريبة
  farGovsFee: number       // سعر التوصيل للمحافظات البعيدة
  remoteFee: number        // سعر التوصيل للأطراف والنواحي
}

interface ChatSession {
  id: string
  customerName: string
  customerHandle: string
  customerPhone: string
  platform: "whatsapp" | "instagram" | "tiktok"
  status: "BOT_ACTIVE" | "HUMAN_OVERRIDE" | "CANCELLATION_INQUIRY"
  lastMessageTime: string
  customerProfile: CustomerProfile
  extractedOrder?: {
    name?: string
    handle?: string
    phone?: string
    address?: string
    governorate?: string
    deliveryFee?: number
    productName?: string
    productPrice?: number
    deliveryDate?: string
    isModified?: boolean
    priceDelta?: number
  }
  messages: Message[]
}

export function ChatbotView() {
  const { rules, toggleRule, addRule, deleteRule, incrementRuleHits, merchant, incrementAiUsage } = useApp()

  const [botEnabled, setBotEnabled] = useState(true)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [autoResumeMinutes, setAutoResumeMinutes] = useState(10)

  // 🚚 أسعار وشروط الشحن المحددة من التاجر (افتراضياً: بغداد هي المتجر)
  const [deliveryRates, setDeliveryRates] = useState<DeliveryRates>({
    homeGovName: "بغداد",
    homeGovFee: 4000,
    baghdadFee: 5000,
    nearGovs: ["ديالى", "بابل", "الأنبار", "واسط", "صلاح الدين"], // تحديد افتراضي
    nearGovsFee: 7000,
    farGovsFee: 10000,
    remoteFee: 10000,
  })

  const [openRuleModal, setOpenRuleModal] = useState(false)
  const [openRatesModal, setOpenRatesModal] = useState(false)

  const [trigger, setTrigger] = useState("")
  const [keywords, setKeywords] = useState("")
  const [reply, setReply] = useState("")

  // فحص هل محافظة المتجر هي بغداد؟
  const isHomeGovBaghdad = deliveryRates.homeGovName === "بغداد"

  // تبديل اختيار المحافظة القريبة بنقرة زر
  const toggleNearGov = (gov: string) => {
    setDeliveryRates((prev) => {
      const exists = prev.nearGovs.includes(gov)
      if (exists) {
        return { ...prev, nearGovs: prev.nearGovs.filter((g) => g !== gov) }
      } else {
        return { ...prev, nearGovs: [...prev.nearGovs, gov] }
      }
    })
  }

  const [chats, setChats] = useState<ChatSession[]>([
    {
      id: "chat-1",
      customerName: "علي حسين",
      customerHandle: "@ali_hassan_iq",
      customerPhone: "07701234567",
      platform: "instagram",
      status: "BOT_ACTIVE",
      lastMessageTime: "١٠:٣٢ ص",
      customerProfile: { completedOrders: 4, returnedOrders: 0, riskLevel: "LOW" },
      extractedOrder: {
        name: "علي حسين",
        handle: "@ali_hassan_iq",
        phone: "07701234567",
        address: "بغداد - الكرادة - قرب نفق الشرطة",
        governorate: "بغداد",
        deliveryFee: 4000,
        productName: "ساعة Ultra Smart",
        productPrice: 35000,
        deliveryDate: "اليوم",
        isModified: false,
      },
      messages: [
        { id: "m1", sender: "bot", text: "تم تثبيت طلبك عيوني! ساعة Ultra Smart بسعر 35,000 د.ع وتوصيل اليوم.", time: "١٠:٣٠ ص" },
        { id: "m2", sender: "customer", text: "غيرلي الموعد ليوم السبت القادم وأريد أغير الساعة لموديل الـ Pro بلكت", time: "١٠:٣٢ ص" },
      ],
    },
    {
      id: "chat-2",
      customerName: "سيف السلام",
      customerHandle: "@saif_iq_99",
      customerPhone: "07809876543",
      platform: "whatsapp",
      status: "HUMAN_OVERRIDE",
      lastMessageTime: "١٠:٢٥ ص",
      customerProfile: { completedOrders: 1, returnedOrders: 2, riskLevel: "HIGH" },
      extractedOrder: {
        name: "سيف السلام",
        handle: "@saif_iq_99",
        phone: "07809876543",
        address: "ديالى - بعقوبة",
        governorate: "محافظة قريبة (ديالى)",
        deliveryFee: 7000,
        productName: "سماعات Pro Max",
        productPrice: 25000,
        deliveryDate: "غداً",
        isModified: false,
      },
      messages: [
        { id: "m21", sender: "customer", text: "أكو خصم إذا أخذت قطعتين؟", time: "١٠:٢٠ ص" },
        { id: "m22", sender: "merchant", text: "تدلل عيوني، أعملك إياهم بـ 45 ألف بدل 50", time: "١٠:٢٢ ص" },
      ],
    },
  ])

  const [activeChatId, setActiveChatId] = useState<string>("chat-1")
  const [inputText, setInputText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [senderType, setSenderType] = useState<"customer" | "merchant">("customer")
  const chatBottomRef = useRef<HTMLDivElement>(null)

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0]
  const tokensUsed = merchant?.aiTokensUsed ?? 0
  const tokenLimit = merchant?.aiTokenLimit ?? 500_000
  const isExceeded = tokensUsed >= tokenLimit

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeChat.messages])

  // 🚚 حاسبة الشحن الديناميكية بحسب خيارات التاجر المحددة بالنقر
  const calculateDeliveryFee = (text: string): { gov: string; fee: number } => {
    const cleanText = text.toLowerCase()
    const homeGov = deliveryRates.homeGovName.toLowerCase()

    // 1. الأطراف والنواحي والقرى
    if (cleanText.includes("قضاء") || cleanText.includes("قرية") || cleanText.includes("طرف") || cleanText.includes("ناحية")) {
      return { gov: "أطراف نائية / أقضية", fee: deliveryRates.remoteFee }
    }

    // 2. داخل المحافظة الرئيسية للمتجر
    if (cleanText.includes(homeGov)) {
      return { gov: deliveryRates.homeGovName, fee: deliveryRates.homeGovFee }
    }

    // 3. العاصمة بغداد (إذا لم تكن هي محافظة المتجر)
    if (!isHomeGovBaghdad && (cleanText.includes("بغداد") || cleanText.includes("كرادة") || cleanText.includes("منصور") || cleanText.includes("يرموك"))) {
      return { gov: "بغداد", fee: deliveryRates.baghdadFee }
    }

    // 🎯 4. المحافظات القريبة (الفحص المباشر في عناصر المصفوفة المحددة بالنقر)
    const matchedNearGov = deliveryRates.nearGovs.find((g) => {
      const cleanGov = g.split(" ")[0].toLowerCase() // تنظيف الاسم مثل نينوى من الأقواس
      return cleanText.includes(cleanGov)
    })

    if (matchedNearGov) {
      return { gov: `محافظة قريبة (${matchedNearGov})`, fee: deliveryRates.nearGovsFee }
    }

    // 5. المحافظات البعيدة (بقية المحافظات غير المحددة)
    return { gov: "محافظات بعيدة", fee: deliveryRates.farGovsFee }
  }

  const handleTranscribeVoice = (msgId: string) => {
    const simulatedTranscriptions = [
      "عيوني دزلي المنتج لعنواني ديالى بعقوبة الشارع العام مقابل الشغلات وهذا رقمي 07701234567",
      "أريد قطعتين من الساعة ودزهم للبصرة منطقة الجزاير رقمي 07801112223",
    ]
    const textResult = simulatedTranscriptions[Math.floor(Math.random() * simulatedTranscriptions.length)]
    const delivery = calculateDeliveryFee(textResult)

    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== activeChatId) return c
        return {
          ...c,
          extractedOrder: {
            ...c.extractedOrder,
            name: c.customerName,
            handle: c.customerHandle,
            phone: c.customerPhone,
            address: textResult,
            governorate: delivery.gov,
            deliveryFee: delivery.fee,
          },
          messages: c.messages.map((m) => {
            if (m.id !== msgId) return m
            return {
              ...m,
              text: `🎙️ [تفريغ الفويس الآلي]: "${textResult}"`,
              isTranscribed: true,
            }
          }),
        }
      })
    )
  }

  const handlePostConfirmationEdit = (msgText: string, chatId: string): boolean => {
    const isChangeDate = msgText.includes("غير") || msgText.includes("أجل") || msgText.includes("موعد") || msgText.includes("السبت") || msgText.includes("باجر")
    const isChangeProduct = msgText.includes("Pro") || msgText.includes("موديل") || msgText.includes("لون") || msgText.includes("نوع")

    if (isChangeDate || isChangeProduct) {
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c

          const currentOrder = c.extractedOrder || {
            productName: "ساعة Ultra Smart",
            productPrice: 35000,
            deliveryFee: 4000,
            address: "بغداد - الكرادة",
            governorate: "بغداد",
          }

          let newProductName = currentOrder.productName || "ساعة Ultra Smart"
          let newPrice = currentOrder.productPrice || 35000
          let priceDelta = 0
          let newDeliveryDate = currentOrder.deliveryDate || "اليوم"

          if (isChangeProduct) {
            newProductName = "ساعة Ultra Smart Pro ⭐️"
            newPrice = 45000
            priceDelta = 10000
          }

          if (isChangeDate) {
            newDeliveryDate = "يوم السبت القادم 📅"
          }

          const totalAmount = newPrice + (currentOrder.deliveryFee || 4000)

          const botReplyText = `تدلل عيوني! تم تحديث طلبك بنجاح 🔄:\n• المنتج الجديد: ${newProductName}\n• الموعد الجديد: ${newDeliveryDate}\n${
            priceDelta > 0 ? `• فرق السعر: +${priceDelta.toLocaleString("ar-IQ")} د.ع\n` : ""
          }• المجموع النهائي مع التوصيل: ${totalAmount.toLocaleString("ar-IQ")} د.ع.`

          return {
            ...c,
            extractedOrder: {
              ...currentOrder,
              handle: c.customerHandle,
              productName: newProductName,
              productPrice: newPrice,
              deliveryDate: newDeliveryDate,
              isModified: true,
              priceDelta: priceDelta,
            },
            messages: [
              ...c.messages,
              {
                id: Date.now().toString(),
                sender: "bot",
                text: botReplyText,
                time: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          }
        })
      )
      return true
    }
    return false
  }

  const checkAndParseAddressPassively = (text: string, chatId: string) => {
    const iqPhoneRegex = /(077|078|079|075)\d{8}/
    const addressKeywords = IRAQ_GOVERNORATES.map((g) => g.split(" ")[0])

    const hasPhone = iqPhoneRegex.test(text)
    const hasAddress = addressKeywords.some((kw) => text.includes(kw))

    if (hasPhone || hasAddress) {
      const extractedPhone = text.match(iqPhoneRegex)?.[0] || activeChat.customerPhone
      const delivery = calculateDeliveryFee(text)
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c
          return {
            ...c,
            extractedOrder: {
              ...c.extractedOrder,
              name: c.customerName,
              handle: c.customerHandle,
              phone: extractedPhone,
              address: text,
              governorate: delivery.gov,
              deliveryFee: delivery.fee,
            },
          }
        })
      )
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isGenerating) return

    const msgText = inputText.trim()
    const timeNow = new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" })

    if (senderType === "merchant") {
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== activeChatId) return c
          return {
            ...c,
            status: "HUMAN_OVERRIDE",
            messages: [...c.messages, { id: Date.now().toString(), sender: "merchant", text: msgText, time: timeNow }],
          }
        })
      )
      setInputText("")
      return
    }

    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== activeChatId) return c
        return {
          ...c,
          messages: [...c.messages, { id: Date.now().toString(), sender: "customer", text: msgText, time: timeNow }],
        }
      })
    )
    setInputText("")

    checkAndParseAddressPassively(msgText, activeChatId)

    if (!botEnabled || activeChat.status === "HUMAN_OVERRIDE") return

    setIsGenerating(true)

    const isEditHandled = handlePostConfirmationEdit(msgText, activeChatId)
    if (isEditHandled) {
      setIsGenerating(false)
      return
    }

    const cancelKeywords = ["ألغي", "الغاء", "الغي", "تأخرتوا", "ما أحتاجه", "غيرت رأيي", "كنسل"]
    if (cancelKeywords.some((kw) => msgText.includes(kw))) {
      setTimeout(() => {
        setChats((prev) =>
          prev.map((c) => {
            if (c.id !== activeChatId) return c
            return {
              ...c,
              status: "CANCELLATION_INQUIRY",
              messages: [
                ...c.messages,
                {
                  id: Date.now().toString(),
                  sender: "bot",
                  text: "عسى ما شر عيوني، ليش تحب تلغي الطلب؟ إذا أكو أي مشكلة بالتوصيل أو التأخير تدلل ونستعجل لك المندوب حالاً 🌸",
                  time: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }
          })
        )
        setIsGenerating(false)
      }, 500)
      return
    }

    const matchedRule = rules.find((r) => {
      if (!r.enabled) return false
      const kws = r.keywords.split(/[،,]/).map((k) => k.trim().toLowerCase())
      return kws.some((kw) => kw.length > 0 && msgText.toLowerCase().includes(kw))
    })

    if (matchedRule) {
      incrementRuleHits(matchedRule.id)
      setTimeout(() => {
        setChats((prev) =>
          prev.map((c) => {
            if (c.id !== activeChatId) return c
            return {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: Date.now().toString(),
                  sender: "bot",
                  text: matchedRule.reply,
                  time: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }
          })
        )
        setIsGenerating(false)
      }, 400)
      return
    }

    if (!aiEnabled || isExceeded) {
      setIsGenerating(false)
      return
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msgText,
          planId: merchant?.activePlanId || "pro",
          model: merchant?.aiModel || "gemini-2.5-flash",
          conversationHistory: activeChat.messages.slice(-4).map((m) => ({
            role: m.sender === "bot" ? "model" : "user",
            parts: [{ text: m.text }],
          })),
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.details || data.error || "خطأ في الاتصال")

      incrementAiUsage(1500)

      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== activeChatId) return c
          return {
            ...c,
            messages: [
              ...c.messages,
              {
                id: Date.now().toString(),
                sender: "bot",
                text: data.reply || "عذراً عيوني، صار خلل بسيط.",
                time: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          }
        })
      )
    } catch (error) {
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6 rtl">
      
      {/* 🎛️ شريط التحكم الرئيسي */}
      <div className="p-4 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBotEnabled(!botEnabled)}
              className={cn(
                "h-10 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm",
                botEnabled ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-muted text-muted-foreground"
              )}
            >
              <Power className="h-4 w-4" />
              {botEnabled ? "البوت يعمل (مفعل)" : "البوت متوقف"}
            </button>

            <button
              onClick={() => setAiEnabled(!aiEnabled)}
              className={cn(
                "h-10 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm border",
                aiEnabled ? "bg-primary/10 text-primary border-primary/30" : "bg-muted/50 text-muted-foreground"
              )}
            >
              <Zap className="h-4 w-4 text-amber-500" />
              {aiEnabled ? "الذكاء الاصطناعي وتعديل الطلبات (مفعل 🔄)" : "معطل"}
            </button>

            <button
              onClick={() => setOpenRatesModal(true)}
              className="h-10 px-3.5 rounded-xl bg-secondary text-secondary-foreground font-bold text-xs border border-border hover:bg-secondary/80 transition-all flex items-center gap-1.5"
            >
              <Truck className="h-4 w-4 text-primary" />
              تخصيص أسعار الشحن 🚚
            </button>
          </div>

          <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl border border-border">
            <Clock className="h-4 w-4 text-primary shrink-0 mr-1" />
            <span className="text-xs font-semibold text-muted-foreground">مهلة صمت البوت:</span>
            <select
              value={autoResumeMinutes}
              onChange={(e) => setAutoResumeMinutes(Number(e.target.value))}
              className="h-8 px-2 rounded-lg bg-background border border-border text-xs font-mono font-bold"
            >
              <option value={5}>5 دقائق</option>
              <option value={10}>10 دقائق</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">استهلاك التوكنات:</span>
            <span className="font-mono font-bold bg-muted px-2 py-0.5 rounded text-foreground">
              {tokensUsed.toLocaleString("ar-IQ")} / {tokenLimit.toLocaleString("ar-IQ")}
            </span>
          </div>

          <button
            onClick={() => setOpenRuleModal(true)}
            className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground flex items-center gap-2 shadow-md shadow-primary/20 hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            إضافة كلمة مفتاحية ورّد جاهز (توفير التوكنز) ⚡
          </button>
        </div>
      </div>

      <StatCards stats={chatbotStats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        
        {/* قائمة القواعد الجاهزة */}
        <section className="rounded-xl border border-border bg-card xl:col-span-5 shadow-sm">
          <div className="border-b border-border p-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold tracking-tight text-sm">قواعد الرد التلقائي المجاني</h2>
              <p className="text-[11px] text-muted-foreground">ردود فورية بسرعة 0.1 ثانية وبدون توكنات.</p>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500">
              0 توكنز ⚡
            </span>
          </div>
          <ul className="divide-y divide-border max-h-125 overflow-y-auto">
            {rules.length === 0 ? (
              <li className="p-6 text-center text-xs text-muted-foreground">لا توجد قواعد رد جاهزة حالياً.</li>
            ) : (
              rules.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3 p-4 hover:bg-muted/20 transition-colors">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs">{r.trigger}</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
                        {r.hits.toLocaleString("ar-IQ")} رد مجاني
                      </span>
                    </div>
                    <p className="text-[11px] text-primary font-mono">
                      الكلمات: <span className="text-foreground font-sans">{r.keywords}</span>
                    </p>
                    <p className="text-[11px] leading-relaxed text-muted-foreground bg-muted/30 p-2 rounded-md">
                      "{r.reply}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      role="switch"
                      aria-checked={r.enabled}
                      onClick={() => toggleRule(r.id)}
                      className={cn("relative h-5 w-9 rounded-full transition-colors", r.enabled ? "bg-primary" : "bg-muted")}
                    >
                      <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", r.enabled ? "right-0.5" : "right-4.5")} />
                    </button>
                    <button onClick={() => deleteRule(r.id)} className="p-1 text-muted-foreground hover:text-destructive rounded-md">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* 💬 منطقة إدارة المحادثات الحية */}
        <section className="xl:col-span-7 grid grid-cols-1 md:grid-cols-12 rounded-xl border border-border bg-card shadow-sm overflow-hidden h-155">
          
          <div className="md:col-span-4 border-l border-border flex flex-col bg-muted/20">
            <div className="p-3 border-b border-border bg-card">
              <h3 className="font-bold text-xs text-foreground flex items-center justify-between">
                <span>المحادثات النشطة</span>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">
                  {chats.length}
                </span>
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border/60">
              {chats.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setActiveChatId(c.id)}
                  className={`p-3 cursor-pointer transition-all ${
                    activeChatId === c.id ? "bg-primary/10 border-r-4 border-primary" : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-foreground truncate">{c.customerName}</span>
                    <span className="text-[9px] text-muted-foreground">{c.lastMessageTime}</span>
                  </div>

                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-primary flex items-center gap-0.5">
                      <AtSign className="h-3 w-3 text-primary/70" />
                      {c.customerHandle.replace("@", "")}
                    </span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border">
                      {c.platform}
                    </span>
                  </div>

                  {c.extractedOrder?.isModified && (
                    <span className="inline-flex items-center gap-1 text-[9px] bg-amber-500/15 text-amber-500 font-bold px-1.5 py-0.5 rounded border border-amber-500/30 mb-1">
                      <RefreshCw className="h-3 w-3 animate-spin" /> تعديل حديث
                    </span>
                  )}

                  <p className="text-[10px] text-muted-foreground truncate">{c.messages[c.messages.length - 1]?.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-8 flex flex-col h-full bg-background/40">
            
            <div className="p-3 border-b border-border bg-card flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-foreground">{activeChat.customerName}</h4>
                    
                    <a
                      href={`https://${activeChat.platform}.com/${activeChat.customerHandle.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-1"
                      title="فتح حساب الزبون المباشر"
                    >
                      <AtSign className="h-3 w-3" />
                      {activeChat.customerHandle.replace("@", "")}
                      <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                    </a>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{activeChat.customerPhone} • {activeChat.platform.toUpperCase()}</p>
                </div>
              </div>

              {activeChat.customerProfile.riskLevel === "HIGH" ? (
                <span className="text-[10px] bg-red-500/15 text-red-400 font-bold px-2 py-1 rounded-lg border border-red-500/30 flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> راجع سابق ({activeChat.customerProfile.returnedOrders})
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> زبون موثوق
                </span>
              )}
            </div>

            {/* 🚚 الوصل مع أجور التوصيل المحسوبة */}
            {activeChat.extractedOrder && (
              <div className={`m-3 p-3 rounded-xl text-[11px] space-y-1.5 border ${
                activeChat.extractedOrder.isModified
                  ? "bg-amber-500/10 border-amber-500/40"
                  : "bg-emerald-500/10 border-emerald-500/30"
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span className={`flex items-center gap-1.5 ${
                    activeChat.extractedOrder.isModified ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {activeChat.extractedOrder.isModified ? (
                      <>
                        <RefreshCw className="h-4 w-4 text-amber-400" />
                        وصل طلب معدّل تلقائياً:
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        تفاصيل الطلب المؤكد:
                      </>
                    )}
                  </span>

                  <span className="text-[10px] font-mono bg-background/80 text-foreground px-2 py-0.5 rounded border flex items-center gap-1">
                    <AtSign className="h-3 w-3 text-primary" />
                    {activeChat.customerHandle}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground font-mono">
                  <div>🛍️ المنتج: <strong className="text-foreground">{activeChat.extractedOrder.productName}</strong></div>
                  <div>📅 الموعد: <strong className="text-foreground">{activeChat.extractedOrder.deliveryDate}</strong></div>
                  <div>📍 العنوان: {activeChat.extractedOrder.address}</div>
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" />
                    التوصيل ({activeChat.extractedOrder.governorate}): {activeChat.extractedOrder.deliveryFee?.toLocaleString("ar-IQ")} د.ع
                  </div>
                  <div className="col-span-2 text-primary font-bold text-xs pt-1 border-t border-border/40">
                    💰 المجموع الكلي: {((activeChat.extractedOrder.productPrice || 35000) + (activeChat.extractedOrder.deliveryFee || 4000)).toLocaleString("ar-IQ")} د.ع
                  </div>
                </div>
              </div>
            )}

            {/* قائمة الرسائل مع الفويسات */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {activeChat.messages.map((m) => {
                const isBot = m.sender === "bot"
                const isMerchant = m.sender === "merchant"
                const isVoice = m.type === "voice"

                return (
                  <div key={m.id} className={`flex gap-2 ${m.sender === "customer" ? "flex-row" : "flex-row-reverse"}`}>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isBot ? "bg-primary/15 text-primary" : isMerchant ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"
                    }`}>
                      {isBot ? <Bot className="h-3.5 w-3.5" /> : isMerchant ? <UserCheck className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                    </span>

                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
                      isBot ? "bg-muted text-foreground rounded-tr-none" : isMerchant ? "bg-emerald-600 text-white rounded-tl-none" : "bg-primary text-primary-foreground rounded-tl-none"
                    }`}>
                      {isVoice ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
                            <Play className="h-4 w-4 text-white fill-white shrink-0" />
                            <div className="h-1.5 flex-1 bg-white/30 rounded-full overflow-hidden">
                              <div className="w-1/3 h-full bg-white" />
                            </div>
                            <span className="font-mono text-[10px]">{m.audioDuration}</span>
                            <Mic className="h-3.5 w-3.5 text-white/80" />
                          </div>

                          {!m.isTranscribed ? (
                            <button
                              onClick={() => handleTranscribeVoice(m.id)}
                              className="w-full text-[10px] font-bold py-1 px-2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all flex items-center justify-center gap-1.5"
                            >
                              <FileText className="h-3 w-3" /> تفريغ الفويس بالذكاء الاصطناعي (STT) 🪄
                            </button>
                          ) : (
                            <p className="text-[11px] font-medium leading-relaxed bg-black/20 p-2 rounded text-emerald-300">
                              {m.text}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p>{m.text}</p>
                      )}

                      <p className="mt-1 text-[9px] opacity-70 text-left">{m.time}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-2 border-t border-border bg-card space-y-2">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
                <span>تحديد صاحب الرد:</span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="sender" checked={senderType === "customer"} onChange={() => setSenderType("customer")} className="accent-primary" />
                    <span>الزبون</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="sender" checked={senderType === "merchant"} onChange={() => setSenderType("merchant")} className="accent-emerald-500" />
                    <span className="text-emerald-500 font-bold">التاجر (يدوي - المراقبة الصامتة)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="جرب رسالة تعديل: (غيرلي الموعد للسبت / أريد الموديل الـ Pro)..."
                  className="flex-1 h-9 rounded-lg border border-border px-3 text-xs bg-background outline-none focus:border-primary"
                />
                <button type="submit" className="h-9 px-3.5 rounded-lg bg-primary font-bold text-xs text-white">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>

          </div>
        </section>
      </div>

      {/* 🚚 Modal تخصيص أجور الشحن مع لوحة اختيار المحافظات بالنقر */}
      <Modal open={openRatesModal} onClose={() => setOpenRatesModal(false)} title="تخصيص أسعار وتصنيف الشحن للمتجر">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setOpenRatesModal(false)
          }}
          className="space-y-4 text-xs"
        >
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-foreground space-y-1">
            <div className="font-bold text-primary flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              تحديد أسعار الشحن بالنقر المباشر 👆
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              اختر محافظتك المباشرة، ثم اضغط على المحافظات القريبة منك لتحديدها. المحافظات غير المحددة ستُصنّف تلقائياً ضمن المحافظات البعيدة.
            </p>
          </div>

          {/* 1️⃣ اختيار محافظة المتجر من قائمة جاهزة */}
          <div>
            <label className="block font-semibold mb-1 text-foreground">محافظة متجرك الرئيسية (التي ينطلق منها التوصيل)</label>
            <select
              value={deliveryRates.homeGovName}
              onChange={(e) => {
                const newHome = e.target.value
                setDeliveryRates({
                  ...deliveryRates,
                  homeGovName: newHome,
                  nearGovs: deliveryRates.nearGovs.filter((g) => g !== newHome), // إزالة المحافظة الرئيسية من قائمة القريبة
                })
              }}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary font-bold text-foreground cursor-pointer"
            >
              {IRAQ_GOVERNORATES.map((gov) => (
                <option key={gov} value={gov}>
                  📍 {gov}
                </option>
              ))}
            </select>
          </div>

          {/* 2️⃣ اختيار المحافظات القريبة بالنقر المباشر (Interactive Chips) */}
          <div className="space-y-2 border border-border/80 p-3 rounded-xl bg-muted/20">
            <div className="flex items-center justify-between">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <span>المحافظات القريبة منك (اضغط للتحديد):</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full">
                  {deliveryRates.nearGovs.length} محافظة قريبة 🟢
                </span>
              </label>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1 max-h-36 overflow-y-auto p-1">
              {IRAQ_GOVERNORATES.filter((g) => g !== deliveryRates.homeGovName).map((gov) => {
                const isSelected = deliveryRates.nearGovs.includes(gov)
                return (
                  <button
                    key={gov}
                    type="button"
                    onClick={() => toggleNearGov(gov)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border",
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-sm scale-105"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {isSelected ? <Check className="h-3 w-3 text-white" /> : <Plus className="h-3 w-3 text-muted-foreground" />}
                    {gov}
                  </button>
                )
              })}
            </div>
            <p className="text-[10px] text-muted-foreground">
              💡 المحافظات المحددة بالأخضر تُحسب بسعر (المحافظات القريبة)، وباقي المحافظات تُحسب بسعر (المحافظات البعيدة).
            </p>
          </div>

          {/* 3️⃣ أسعار الشحن المخصصة */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* سعر داخل محافظة المتجر */}
            <div>
              <label className="block font-semibold mb-1 text-foreground">
                داخل {deliveryRates.homeGovName} (د.ع)
              </label>
              <input
                type="number"
                required
                value={deliveryRates.homeGovFee}
                onChange={(e) => setDeliveryRates({ ...deliveryRates, homeGovFee: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary font-mono font-bold"
              />
            </div>

            {/* سعر العاصمة بغداد (يتعطل تلقائياً إذا كانت محافظة المتجر بغداد) */}
            <div>
              <label className="font-semibold mb-1 text-foreground flex items-center justify-between">
                <span>إلى العاصمة بغداد (د.ع)</span>
                {isHomeGovBaghdad && <span className="text-[9px] text-amber-500 font-bold">(هي المحافظة الرئيسية)</span>}
              </label>
              <div className="relative">
                <input
                  type="number"
                  disabled={isHomeGovBaghdad}
                  value={isHomeGovBaghdad ? deliveryRates.homeGovFee : deliveryRates.baghdadFee}
                  onChange={(e) => setDeliveryRates({ ...deliveryRates, baghdadFee: Number(e.target.value) })}
                  className={cn(
                    "h-10 w-full rounded-lg border border-border px-3 text-xs outline-none font-mono font-bold transition-all",
                    isHomeGovBaghdad
                      ? "bg-muted/60 text-muted-foreground cursor-not-allowed border-dashed opacity-60"
                      : "bg-background focus:border-primary text-foreground"
                  )}
                />
                {isHomeGovBaghdad && (
                  <Ban className="h-4 w-4 text-muted-foreground absolute left-3 top-3 opacity-60" />
                )}
              </div>
            </div>

            {/* سعر المحافظات القريبة */}
            <div>
              <label className="block font-semibold mb-1 text-foreground">
                المحافظات القريبة (د.ع)
              </label>
              <input
                type="number"
                required
                value={deliveryRates.nearGovsFee}
                onChange={(e) => setDeliveryRates({ ...deliveryRates, nearGovsFee: Number(e.target.value) })}
                placeholder="7000"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary font-mono font-bold text-emerald-400"
              />
            </div>

            {/* سعر المحافظات البعيدة */}
            <div>
              <label className="block font-semibold mb-1 text-foreground">
                المحافظات البعيدة (المتبقية) (د.ع)
              </label>
              <input
                type="number"
                required
                value={deliveryRates.farGovsFee}
                onChange={(e) => setDeliveryRates({ ...deliveryRates, farGovsFee: Number(e.target.value) })}
                placeholder="10000"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary font-mono font-bold"
              />
            </div>

            {/* سعر الأطراف والنواحي */}
            <div className="col-span-2">
              <label className="block font-semibold mb-1 text-foreground">
                الأطراف والنواحي والقرى النائية (د.ع)
              </label>
              <input
                type="number"
                required
                value={deliveryRates.remoteFee}
                onChange={(e) => setDeliveryRates({ ...deliveryRates, remoteFee: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <button type="submit" className="flex-1 h-10 rounded-lg bg-primary font-bold text-primary-foreground hover:opacity-90">
              حفظ الأسعار والتصنيفات وتطبيقها فوراً 🚚
            </button>
            <button
              type="button"
              onClick={() => setOpenRatesModal(false)}
              className="h-10 rounded-lg border border-border px-4 font-medium"
            >
              إلغاء
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal إضافة كلمة مفتاحية */}
      <Modal open={openRuleModal} onClose={() => setOpenRuleModal(false)} title="إضافة كلمة مفتاحية ورّد جاهز">
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Lightbulb className="h-4 w-4 shrink-0" />
              لماذا ينصح بإنشاء كلمات مفتاحية وردود جاهزة؟
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              إنشاء ردود جاهزة للأسئلة المكررة يضمن لزبائنك **رداً فورياً مجانياً (0 توكنز)** دون الحاجة لاستدعاء الذكاء الاصطناعي، مما **يحمي باقة التوكنات لديك من النفاد**!
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setOpenRuleModal(false); }} className="space-y-3">
            <div>
              <label className="block font-semibold mb-1">عنوان القاعدة</label>
              <input
                required
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                placeholder="مثال: عنوان المحل"
                className="h-10 w-full rounded-lg border border-border bg-muted/20 px-3 text-xs outline-none focus:border-ring"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">الكلمات المفتاحية (افصل بينها بفاصلة)</label>
              <input
                required
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="مثال: موقعكم، وين المحل، الفرع، العنوان"
                className="h-10 w-full rounded-lg border border-border bg-muted/20 px-3 text-xs outline-none focus:border-ring"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">الرد التلقائي الجاهز (0 توكنز)</label>
              <textarea
                required
                rows={3}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="أهلاً بك عيوني! موقعنا في بغداد..."
                className="w-full rounded-lg border border-border bg-muted/20 p-3 text-xs outline-none focus:border-ring"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 h-10 rounded-lg bg-primary font-semibold text-primary-foreground hover:opacity-90">
                حفظ القاعدة وتوفير التوكنز ⚡
              </button>
              <button
                type="button"
                onClick={() => setOpenRuleModal(false)}
                className="h-10 rounded-lg border border-border px-4 font-medium"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}