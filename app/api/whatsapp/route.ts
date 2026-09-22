import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// قاعدة بيانات المنتجات مع تطبيق قواعد الندرة (إخفاء العدد الكبير وإظهار القليل)
const storeProducts = [
  {
    id: 1,
    name: "سماعة ألعاب احترافية RGB",
    price: 35000,
    available: true,
    stock: 12, // عدد كبير، لا يظهر للزبون
    sizes: ["قياسي موحد"],
    features: "عزل ضوضاء ممتاز، إضاءة RGB، ميكروفون عالي التصفية، ضمان حقيقي لمدة 6 أشهر.",
    related: [2]
  },
  {
    id: 2,
    name: "ساعة ذكية Ultra Smart",
    price: 45000,
    available: true,
    stock: 1, // قطعة واحدة، سيتم إظهارها لتحفيز الشراء الفوري
    sizes: ["49mm"],
    features: "شاشة AMOLED عالية الدقة، تدعم المكالمات، مقاومة للماء، بطارية تدوم طويلاً.",
    related: [1]
  }
];

function isValidIraqiPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "")
  const iraqiRegex = /^(0)?(77|78|79|75)\d{8}$/
  return iraqiRegex.test(cleanPhone)
}

// 1. التحقق من الـ Webhook الخاص بـ WhatsApp (Meta Verification)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  // رمز التحقق السري (يمكنك وضعه في ملف .env.local باسم WHATSAPP_VERIFY_TOKEN)
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "elite_iraq_whatsapp_token"

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: "Unauthorized token" }, { status: 403 })
}

// 2. استقبال رسائل الزبائن الواردة من واتساب والرد عليها بالذكاء الاصطناعي
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // التحقق من بنية رسالة الواتساب الواردة عبر Meta Cloud API
    const entry = body?.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const messageData = value?.messages?.[0]

    if (!messageData) {
      return NextResponse.json({ status: "No message received" }, { status: 200 })
    }

    const senderPhone = messageData.from // رقم هاتف الزبون المرسل
    const userMessage = messageData.text?.body // نص الرسالة

    if (!userMessage) {
      return NextResponse.json({ status: "Empty message text" }, { status: 200 })
    }

    // بناء شخصية البوت العراقي لمتجر "إيليت العراق"
    const systemInstruction = `
    أنت مساعد مبيعات ذكي وودود جداً في متجر عراقي ضمن منصة "إيليت العراق". تتحدث باللهجة العراقية الدارجة والراقية.

    معلومات مخزن المنتجات المتوفرة حالياً:
    ${JSON.stringify(storeProducts, null, 2)}

    تعليمات هامة جداً:
    1. أجب الزبون عن منتجات المتجر وأسعارها ومميزاتها باللهجة العراقية الودودة.
    2. **قاعدة الندرة (Scarcity)**: لا تذكر أبداً العدد الكلي للقطع إذا كانت كثيرة (أكثر من قطعتين). اذكر فقط أنه متوفر وأصيل. **لكن** إذا كانت الكمية المتبقية قطعة أو قطعتين فقط (Stock <= 2)، قم بذكر ذلك لتحفيز الزبون (مثل: "بقيت قطعة وحدة فقط، الحگ عليها قبل لا تخلص!").
    3. اقترح منتجات بديلة أو إضافية بذكاء (Cross-selling) لرفع قيمة السلة.
    4. راقب الحوار واستخرج بيانات الطلب إذا وافق الزبون على الشراء:
       - customerName: اسم الزبون.
       - customerPhone: رقم الهاتف العراقي (يبدأ بـ 077, 078, 079, 075).
       - customerAddress: العنوان بالتفصيل (المحافظة والمنطقة).
       - isOrderCompleted: true فقط إذا توافرت البيانات وأكد الطلب تماماً، وإلا false.

    أجب بصيغة JSON صالح حصراً وبدون أي إضافات خارجه:
    {
      "reply": "نص الرد العراقي المناسب والذكي مع تفاصيل المنتج والاقتراحات",
      "extractedData": {
        "customerName": "...",
        "customerPhone": "...",
        "customerAddress": "..."
      },
      "isOrderCompleted": false
    }
    `

    // استدعاء نموذج جيميناي للرد الفوري
    const response = await ai.models.generateContent({
      model: 'models/gemini-3.6-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemInstruction}\n\nرسالة الزبون عبر الواتساب: ${userMessage}` }] }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedData = JSON.parse(response.text || "{}");

    // التحقق الصارم من صحة رقم الهاتف العراقي في حال اكتمال الطلب
    if (parsedData.isOrderCompleted && parsedData.extractedData?.customerPhone) {
      if (!isValidIraqiPhone(parsedData.extractedData.customerPhone)) {
        parsedData.isOrderCompleted = false;
        parsedData.reply = "عذراً عيوني، رقم الهاتف مو صحيح أو مو تابع لشبكات العراق (زين، أسياسيل، كورك). ممكن تكتب رقمك الصحيح؟";
      } else {
        console.log("🚀 [طلب جديد عبر واتساب تم بنجاح]:", parsedData.extractedData);
        // [هنا سيتم لاحقاً حفظ الطلب في قاعدة البيانات أو إرسال إشعار للتاجر]
      }
    }

    // 3. إرسال الرد تلقائياً إلى رقم هاتف الزبون عبر WhatsApp Cloud API الرسمي
    const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID

    if (WHATSAPP_TOKEN && PHONE_NUMBER_ID) {
      await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: senderPhone,
          text: { body: parsedData.reply },
        }),
      });
    }

    return NextResponse.json({ success: true, botReply: parsedData.reply })
  } catch (error: any) {
    console.error("WhatsApp Webhook Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}