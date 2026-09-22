import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { seedReplyRules } from "@/lib/data"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" })

const storeProducts = [
  {
    id: 1,
    name: "سماعة ألعاب احترافية RGB",
    price: 35000,
    available: true,
    stock: 12,
    sizes: ["قياسي موحد"],
    features: "عزل ضوضاء ممتاز، إضاءة RGB، ميكروفون عالي التصفية، ضمان حقيقي لمدة 6 أشهر.",
    related: [2]
  },
  {
    id: 2,
    name: "ساعة ذكية Ultra Smart",
    price: 45000,
    available: true,
    stock: 1,
    sizes: ["49mm"],
    features: "شاشة AMOLED عالية الدقة، تدعم المكالمات، مقاومة للماء، بطارية تدوم طويلاً.",
    related: [1]
  }
];

const GREETINGS = [
  "سلام عليكم",
  "السلام عليكم",
  "هلو",
  "هلا",
  "مرحبا",
  "مرجبا",
  "صباح الخير",
  "مساء الخير",
  "عيوني",
  "حبيبي",
  "اخوي",
  "شلونك",
  "شلونكم",
]

function isValidIraqiPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "")
  const iraqiRegex = /^(0)?(77|78|79|75)\d{8}$/
  return iraqiRegex.test(cleanPhone)
}

// 1. التحقق من الـ Webhook الخاص بـ Meta (Messenger & Instagram) عند الربط لأول مرة
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "elite_iraq_secure_token"

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
}

// 2. استقبال الرسائل الواردة وتوفير التوكنات بالنظام الهجين
export async function POST(request: Request) {
  try {
    const body = await request.json()
    let userMessage = ""
    let senderId = ""
    let platform = "chat_preview"

    // دعم طلبات المعاينة المباشرة من الواجهة أو من Webhooks المنصات
    if (body.message) {
      userMessage = body.message
    } else if (body.object === "page" || body.object === "instagram") {
      platform = body.object === "instagram" ? "instagram" : "messenger"
      const entry = body.entry?.[0]
      const messagingEvent = entry?.messaging?.[0] || entry?.changes?.[0]?.value
      userMessage = messagingEvent?.message?.text || messagingEvent?.text
      senderId = messagingEvent?.sender?.id || messagingEvent?.from?.id
    } else if (body.platform === "tiktok" || body.event === "message.receive") {
      platform = "tiktok"
      userMessage = body.content?.text
      senderId = body.sender?.open_id
    }

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json({ status: "No message found" }, { status: 200 })
    }

    const cleanMsg = userMessage.trim().toLowerCase()

    // -------------------------------------------------------------
    // المرحلة 1: تصفية التحيات البسيطة (0 توكنات)
    // -------------------------------------------------------------
    const isGreetingOnly = GREETINGS.some(
      (g) => cleanMsg === g || cleanMsg === `${g}👋` || cleanMsg === `${g} 👋`
    )
    if (isGreetingOnly) {
      return NextResponse.json({
        success: true,
        reply: "وعليكم السلام والرحمة! أهلاً بك في متجرنا 👋 شلون أقدر أساعدك اليوم؟",
        extractedData: { customerName: "", customerPhone: "", customerAddress: "" },
        isOrderCompleted: false,
        aiResponse: {
          reply: "وعليكم السلام والرحمة! أهلاً بك في متجرنا 👋 شلون أقدر أساعدك اليوم؟",
          extractedData: { customerName: "", customerPhone: "", customerAddress: "" },
          isOrderCompleted: false
        }
      })
    }

    // -------------------------------------------------------------
    // المرحلة 2: الفحص المحلي القائم على القواعد (Rule Matching - 0 توكنات)
    // -------------------------------------------------------------
    let matchedRuleReply: string | null = null
    if (Array.isArray(seedReplyRules)) {
      for (const rule of seedReplyRules) {
        if (!rule.enabled) continue
        const kws = rule.keywords.split(/[،,]/).map((k) => k.trim().toLowerCase())
        if (kws.some((kw) => kw.length > 0 && cleanMsg.includes(kw))) {
          matchedRuleReply = rule.reply
          break
        }
      }
    }

    let remainingText = cleanMsg
    GREETINGS.forEach((g) => {
      remainingText = remainingText.replace(new RegExp(`\\b${g}\\b`, "g"), "").trim()
    })

    // إذا كانت الرسالة سؤالاً بطلاقة وحسب قاعدة محلية متوفرة
    if (matchedRuleReply && remainingText.length < 35) {
      return NextResponse.json({
        success: true,
        reply: `أهلاً بك! 👋 ${matchedRuleReply}`,
        extractedData: { customerName: "", customerPhone: "", customerAddress: "" },
        isOrderCompleted: false,
        aiResponse: {
          reply: `أهلاً بك! 👋 ${matchedRuleReply}`,
          extractedData: { customerName: "", customerPhone: "", customerAddress: "" },
          isOrderCompleted: false
        }
      })
    }

    // -------------------------------------------------------------
    // المرحلة 3: الاستعانة بـ Gemini 2.5 للرسائل المركبة والمبيعات
    // -------------------------------------------------------------
    const systemInstruction = `
    أنت مساعد مبيعات ذكي وودود جداً لمتجر عراقي ضمن منصة "إيليت العراق". تتحدث باللهجة العراقية الدارجة والطبيعية والمهذبة.

    معلومات الخدمة وأسعار التوصيل:
    - التوصيل لبغداد: 5,000 دينار عراقي.
    - التوصيل لباقي المحافظات: 8,000 دينار عراقي.
    - مدة التوصيل: خلال 24 إلى 48 ساعة.

    معلومات مخزن المنتجات:
    ${JSON.stringify(storeProducts, null, 2)}

    تعليمات هامة:
    1. إذا دمج الزبون تحية مع عدة أسئلة (مثل السعر والتوصيل وموعد الوصول)، رحب به بأسلوب عراقي لطيف وأجب عن **جميع أسئلته في رد واحد شامل ومختصر**.
    2. أجب الزبون عن المنتجات وأسعارها وتوفرها بدقة. لا تذكر العدد الكلي للقطع إلا إذا كانت المتبقية قطعة أو قطعتين (Stock <= 2)، اذكر ذلك لتحفيزه (مثلاً: "بقيت قطعة وحدة فقط الحگ عليها!").
    3. اقترح منتجات بديلة أو إضافية بذكاء (Cross-selling).
    4. راقب الحوار واستخرج بيانات الطلب إذا وافق الزبون على الشراء:
       - customerName: اسم الزبون.
       - customerPhone: رقم الهاتف العراقي (يبدأ بـ 077, 078, 079, 075).
       - customerAddress: العنوان بالتفصيل.
       - isOrderCompleted: true فقط إذا توافرت البيانات الثلاثة وأكد الطلب تماماً، وإلا false.

    أجب بصيغة JSON صالح حصراً وبدون أي إضافات:
    {
      "reply": "الرد العراقي المناسب والكامل للزبون",
      "extractedData": {
        "customerName": "...",
        "customerPhone": "...",
        "customerAddress": "..."
      },
      "isOrderCompleted": false
    }
    `

    // استدعاء جيميناي 2.5 للرد الفوري
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemInstruction}\n\nرسالة الزبون (${platform}): ${userMessage}` }] }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedData = JSON.parse(response.text || "{}");

    // التحقق من رقم الهاتف العراقي في حال اكتمال الطلب
    if (parsedData.isOrderCompleted && parsedData.extractedData?.customerPhone) {
      if (!isValidIraqiPhone(parsedData.extractedData.customerPhone)) {
        parsedData.isOrderCompleted = false;
        parsedData.reply = "عذراً عيوني، رقم الهاتف مو صحيح أو مو تابع لشبكات العراق (زين، أسياسيل، كورك). ممكن تكتب رقمك الصحيح؟";
      } else {
        console.log(`🚀 [طلب جديد مكتمل عبر ${platform}] للزبون:`, parsedData.extractedData);
      }
    }

    return NextResponse.json({
      success: true,
      reply: parsedData.reply,
      extractedData: parsedData.extractedData,
      isOrderCompleted: parsedData.isOrderCompleted,
      aiResponse: parsedData
    })
  } catch (error: any) {
    console.error("Webhook / Chat API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}