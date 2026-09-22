import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { seedReplyRules, getStoreKnowledgeContext } from "@/lib/data"

// تهيئة عميل الذكاء الاصطناعي Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
})

// قائمة عبارات التحية الشائعة لتصفيتها ومعالجتها
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const MY_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || "elite_iraq_secret_123"

  if (searchParams.get("hub.mode") === "subscribe" && searchParams.get("hub.verify_token") === MY_VERIFY_TOKEN) {
    return new NextResponse(searchParams.get("hub.challenge"), { status: 200 })
  }
  return new NextResponse("Forbidden", { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📥 [الإشعار الوارد]:", JSON.stringify(body))

    let senderId: string | null = null
    let messageText: string | null = null

    // استخراج معرّف الزبون والنص بدقة
    if (body.entry && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        const events = [...(entry.messaging || []), ...(entry.standby || []), ...(entry.changes || [])]
        for (const event of events) {
          if (event.message?.is_echo) continue

          const sId = event.sender?.id || event.from?.id || event.value?.sender?.id || event.value?.from?.id
          if (sId && String(sId) !== String(entry.id)) {
            senderId = String(sId)
          }

          const txt = event.message?.text || event.value?.text || event.value?.message?.text || event.text
          if (txt) {
            messageText = String(txt)
          }
        }
      }
    }

    if (!senderId) {
      const allIds = extractAllNumericIds(body)
      if (allIds.length > 0) {
        senderId = allIds[allIds.length - 1]
      }
    }

    console.log(`🎯 [الزبون المستهدف]: معرف الزبون = ${senderId} | النص = ${messageText}`)

    if (senderId) {
      let replyText = ""

      if (messageText) {
        // معالجة الرسالة عبر النظام الهجين الذكي
        replyText = await handleSmartHybridReply(messageText)
      } else {
        replyText = "أهلاً بك في Elite Iraq Store! 👋 كيف يمكننا مساعدتك اليوم؟"
      }

      await sendInstagramMessage(senderId, replyText)
    } else {
      console.log("⚠️ لم يتم العثور على معرّف مرسل صالح.")
    }

    return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 })
  } catch (error) {
    console.error("❌ خطأ بمعالجة الـ Webhook:", error)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
}

/**
 * معالجة الرسائل بذكاء (النظام الهجين المتطور)
 */
async function handleSmartHybridReply(userMessage: string): Promise<string> {
  const cleanMsg = userMessage.trim().toLowerCase()

  // 1. تصفية التحية وفحص إذا كانت الرسالة عبارة عن تحية فقط
  const isGreetingOnly = GREETINGS.some(
    (g) => cleanMsg === g || cleanMsg === `${g}👋` || cleanMsg === `${g} 👋`
  )
  if (isGreetingOnly) {
    return "وعليكم السلام والرحمة! أهلاً بك في Elite Iraq Store 👋 شلون أقدر أساعدك اليوم؟"
  }

  // تصفية عبارات التحية للتحقق من المضمون المتبقي للرسالة
  let remainingText = cleanMsg
  GREETINGS.forEach((g) => {
    remainingText = remainingText.replace(new RegExp(`\\b${g}\\b`, "g"), "").trim()
  })

  // 2. فحص القواعد المحلية (Rule Keyword Matching)
  const matchedRules: string[] = []
  for (const rule of seedReplyRules) {
    if (!rule.enabled) continue
    const kws = rule.keywords.split(/[،,]/).map((k) => k.trim().toLowerCase())
    if (kws.some((kw) => kw.length > 0 && cleanMsg.includes(kw))) {
      matchedRules.push(rule.reply)
    }
  }

  // إذا طابقت قاعدة واحدة بسيطة فقط وكانت الرسالة قصيرة وغير مركبة -> رد ثابت مجاني (0 Tokens)
  if (matchedRules.length === 1 && remainingText.length < 35) {
    console.log("⚡ [الرد السريع]: تم استخدام الرد الثابت لتوفير التوكنات")
    return `أهلاً بك! 👋 ${matchedRules[0]}`
  }

  // 3. إذا كانت الرسالة مركبة (تحتوي أكثر من استفسار، أو سؤال عن سعر منتج معين) -> تحويل لـ Gemini 2.5 Flash
  console.log("🤖 [الذكاء الاصطناعي]: تحويل الرسالة المركبة إلى Gemini 2.5 Flash")
  return await generateGeminiResponse(userMessage)
}

/**
 * توليد رد ذكي مدمج عبر Gemini 2.5 Flash للرسائل المركبة
 */
async function generateGeminiResponse(userMessage: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return `أهلاً بك في Elite Iraq Store! 👋 وصلتنا رسالتك: "${userMessage}"`
  }

  try {
    const storeContext = typeof getStoreKnowledgeContext === "function" ? getStoreKnowledgeContext() : ""

    const systemPrompt = `
    أنت مساعد مبيعات ذكي ومحترف لمتجر "Elite Iraq Store".

    معلومات وسياسات المتجر الأساسية:
    - الموقع الرئيسي: بغداد، العراق.
    - أسعار التوصيل: بغداد (5,000 دينار عراقي)، باقي المحافظات (8,000 دينار عراقي).
    - مدة التوصيل: خلال 24 إلى 48 ساعة.
    - ساعات العمل: يومياً من 10 صباحاً حتى 10 مساءً.

    ${storeContext}

    تعليمات صياغة الرد الذكي:
    1. إذا كانت رسالة الزبون تدمج تحية مع عدة أسئلة (مثل: السعر + التوصيل + موعد الوصول)، رحب به أولاً بأسلوب عراقي ودود ثم أجب عن **جميع أسئلته في رد واحد منظم ومختصر**.
    2. استخدم لهجة عراقية مهذبة ومحترفة مناسبة للتجارة الإلكترونية.
    3. إذا سأل عن منتج محدد، اعطه السعر المباشر والتوفر وأجرة التوصيل فوراً.
    `

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nرسالة الزبون الحالية: "${userMessage}"` }],
        },
      ],
    })

    return response.text?.trim() || "أهلاً بك في Elite Iraq Store! 👋 كيف يمكننا مساعدتك اليوم؟"
  } catch (err) {
    console.error("❌ [فشل توليد الرد من Gemini]:", err)
    return "أهلاً بك في Elite Iraq Store! 👋 تم استلام رسالتك وسيتم الرد عليك فوراً."
  }
}

function extractAllNumericIds(obj: any): string[] {
  let ids: string[] = []
  if (!obj || typeof obj !== "object") return ids

  for (const key of Object.keys(obj)) {
    const val = obj[key]
    if (typeof val === "string" || typeof val === "number") {
      const strVal = String(val)
      if (/^\d{10,}$/.test(strVal) && !ids.includes(strVal)) {
        ids.push(strVal)
      }
    } else if (typeof val === "object" && val !== null) {
      ids = ids.concat(extractAllNumericIds(val))
    }
  }
  return ids
}

async function sendInstagramMessage(recipientId: string, text: string) {
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
  const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID

  const url = `https://graph.facebook.com/v19.0/${INSTAGRAM_ACCOUNT_ID}/messages?access_token=${PAGE_ACCESS_TOKEN}`

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: text },
      }),
    })

    const data = await res.json()
    console.log("🚀 [استجابة خادم ميتا للإرسال]:", JSON.stringify(data))
  } catch (err) {
    console.error("❌ [فشل إرسال الرد العكسي]:", err)
  }
}