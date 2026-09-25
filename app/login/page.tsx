"use client"

/**
 * ============================================================================
 * منصة إيليت العراق (Elite Iraq) — صفحة تسجيل الدخول والتعريف بالمنصة
 * ============================================================================
 * الوظائف الرئيسية التي يتحكم بها هذا الملف:
 * 1. التوثيق بـ 3 طرق: (Email/Password, Phone OTP العراقي, Google OAuth).
 * 2. التوجيه التلقائي لمسار المعالجة /auth/callback بعد توثيق Google.
 * 3. حفظ بيانات التاجر واسم متجره في جدول merchants داخل Supabase.
 * 4. حاسبة تفاعلية للوقت الموفر والأرباح بناءً على حجم الرسائل.
 * 5. محاكي محادثة الذكاء الاصطناعي وتثبيت الطلبات لحظياً.
 * 6. النوافذ المنبثقة لسياسة الخصوصية وعزل بيانات المتاجر وشروط الخدمة.
 * ============================================================================
 */

import { useEffect, useState } from "react"
import { useApp } from "@/lib/app-state"
import { supabase } from "@/lib/supabase"
import {
  Sparkles,
  Bot,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Lock,
  Mail,
  Store,
  Phone,
  LayoutDashboard,
  MessageSquare,
  KeyRound,
  Calculator,
  Check,
  X,
  ClipboardList,
  BarChart3,
} from "lucide-react"

// --------------------------------------------------------------------------
// الحركات (Keyframes) — تحترم إعداد "تقليل الحركة" في نظام المستخدم
// --------------------------------------------------------------------------
const motionCss = `
@keyframes ei-spin { to { transform: rotate(360deg) } }
@keyframes ei-spin-rev { to { transform: rotate(-360deg) } }
@keyframes ei-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
@keyframes ei-ping { 0% { transform: scale(1); opacity: .55 } 100% { transform: scale(2.1); opacity: 0 } }
@keyframes ei-pop { 0% { opacity: 0; transform: translateY(12px) scale(.96) } 100% { opacity: 1; transform: translateY(0) scale(1) } }
@keyframes ei-fill { from { transform: scaleX(0) } to { transform: scaleX(1) } }
@keyframes ei-marquee { from { transform: translateX(0) } to { transform: translateX(50%) } }
@keyframes ei-dot { 0%,80%,100% { opacity: .25; transform: translateY(0) } 40% { opacity: 1; transform: translateY(-3px) } }
@keyframes ei-glow { 0%,100% { opacity: .5 } 50% { opacity: 1 } }

.ei-stage { --r: 118px }
@media (min-width: 640px) { .ei-stage { --r: 145px } }
.ei-spin { animation: ei-spin 26s linear infinite }
.ei-spin-slow { animation: ei-spin 60s linear infinite }
.ei-counter { animation: ei-spin-rev 26s linear infinite }
.ei-float { animation: ei-float 5s ease-in-out infinite }
.ei-float-delay { animation: ei-float 6s ease-in-out 1.2s infinite }
.ei-ping { animation: ei-ping 3.2s cubic-bezier(.2,.6,.3,1) infinite }
.ei-ping-late { animation: ei-ping 3.2s cubic-bezier(.2,.6,.3,1) 1.6s infinite }
.ei-pop { animation: ei-pop .55s cubic-bezier(.2,.8,.2,1) both }
.ei-fill { transform-origin: right; animation: ei-fill 3.6s linear both }
.ei-marquee { animation: ei-marquee 32s linear infinite }
.ei-dot { animation: ei-dot 1.2s ease-in-out infinite }
.ei-glow { animation: ei-glow 3.5s ease-in-out infinite }
.ei-chip { transform: rotate(var(--a)) translateY(calc(var(--r) * -1)) rotate(calc(var(--a) * -1)) }

@media (prefers-reduced-motion: reduce) {
  .ei-spin, .ei-spin-slow, .ei-counter, .ei-float, .ei-float-delay,
  .ei-ping, .ei-ping-late, .ei-marquee, .ei-dot, .ei-glow { animation: none !important }
  .ei-pop, .ei-fill { animation-duration: .01s !important }
}
`

function LogoMark({ size = "sm" }: { size?: "sm" | "lg" }) {
  const box = size === "lg" ? "h-24 w-24 p-4 rounded-3xl" : "h-11 w-11 p-1.5 rounded-xl"
  return (
    <div
      className={`flex items-center justify-center bg-primary text-primary-foreground overflow-hidden shadow-lg shadow-primary/30 border border-primary/20 ${box}`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full fill-current" aria-hidden="true">
        <path d="M50 15 L80 30 L80 55 C80 75 50 90 50 90 C50 90 20 75 20 55 L20 30 Z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="33" y="38" width="8" height="28" rx="2" />
        <rect x="46" y="25" width="8" height="41" rx="2" />
        <rect x="59" y="44" width="8" height="22" rx="2" />
        <path d="M28 58 L45 46 L58 55 L75 38" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

const steps = [
  { icon: MessageSquare, title: "زبونك يسأل", text: "رسالة تصل إلى صفحتك على إنستغرام أو واتساب أو تيك توك." },
  { icon: Zap, title: "المساعد يرد فوراً", text: "رد فوري على مدار الساعة بأسلوب موظف مبيعات محترف." },
  { icon: ClipboardList, title: "الطلب يُثبَّت تلقائياً", text: "الاسم والمحافظة والهاتف تُستخرج من المحادثة بدقة." },
  { icon: BarChart3, title: "المخزون والأرباح تتحدث", text: "مزامنة لحظية مع كل عملية بيع دون أي جهد يدوي." },
]

const STEP_MS = 3600

export default function LoginPage() {
  const { login, register } = useApp()

  const [activeTab, setActiveTab] = useState<"preview" | "auth">("preview")
  const [authMethod, setAuthMethod] = useState<"email" | "phone" | "google">("email")
  const [isRegistering, setIsRegistering] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [storeName, setStoreName] = useState("")

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setStep((s) => (s + 1) % steps.length), STEP_MS)
    return () => clearTimeout(t)
  }, [step])

  const [dailyMessages, setDailyMessages] = useState<number>(60)
  const savedHours = Math.round((dailyMessages * 3 * 30) / 60)
  const extraSales = Math.round(dailyMessages * 0.15 * 30)

  // دالة مساعدة لتهيئة رقم الهاتف العراقي لصيغة الدولية (+964)
  const formatIraqiPhone = (rawPhone: string) => {
    let cleaned = rawPhone.replace(/\D/g, "")
    if (cleaned.startsWith("0")) cleaned = cleaned.substring(1)
    return `+964${cleaned}`
  }

  // --------------------------------------------------------------------------
  // معالجة التسجيل والدخول عبر البريد الإلكتروني (Supabase Auth)
  // --------------------------------------------------------------------------
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isRegistering) {
        if (!storeName.trim()) {
          setError("يرجى كتابة اسم متجرك")
          setLoading(false)
          return
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { store_name: storeName },
          },
        })

        if (signUpError) throw signUpError

        if (data.user) {
          const { error: dbError } = await supabase.from("merchants").insert({
            id: data.user.id,
            store_name: storeName,
            email: email,
          })
          if (dbError && dbError.code !== "23505") {
            console.error("فشل حفظ ملف المتجر:", dbError)
          }
        }

        await login(email, password)
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        await login(email, password)
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------------------------------------------------
  // معالجة التسجيل والدخول عبر رقم الهاتف العراقي (Supabase Phone OTP)
  // --------------------------------------------------------------------------
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const formattedPhone = formatIraqiPhone(phone)

    if (!otpSent) {
      if (!/^(0)?(77|78|79|75)\d{8}$/.test(phone.replace(/\D/g, ""))) {
        setError("يرجى كتابة رقم هاتف عراقي صحيح (زين، أسياسيل، كورك)")
        return
      }
      setLoading(true)

      try {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        })

        if (otpError) throw otpError
        setOtpSent(true)
      } catch (err: any) {
        setError(err.message || "فشل إرسال رمز التحقق SMS. تأكد من تفعيل الخدمة في Supabase")
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(true)
      try {
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otpCode,
          type: "sms",
        })

        if (verifyError) throw verifyError

        if (data.user) {
          await supabase.from("merchants").upsert({
            id: data.user.id,
            phone: formattedPhone,
          })
        }

        // تسجيل الدخول بحساب زائر عادي وليس أدمن
        const demoEmail = "sandbox@elite.iq"
        const demoPass = "Demo12345"
        let msg = await login(demoEmail, demoPass)
        if (msg) {
          await register("مستخدم تجريبي", demoEmail, demoPass, { storeName: "متجر معاينة", phone: formattedPhone })
          await login(demoEmail, demoPass)
        }
      } catch (err: any) {
        setError(err.message || "رمز التحقق غير صحيح")
      } finally {
        setLoading(false)
      }
    }
  }

  // --------------------------------------------------------------------------
  // معالجة التسجيل عبر Google (Supabase OAuth)
  // --------------------------------------------------------------------------
  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (googleError) throw googleError
    } catch (err: any) {
      setError(err.message || "فشل التسجيل باستخدام Google")
      setLoading(false)
    }
  }

  // 👈 دخول تجريبي آمن ومعزول (بدون صلاحيات الأدمن تماماً)
  const handleQuickDemo = async () => {
    setLoading(true)
    setError(null)
    const demoEmail = "sandbox@elite.iq"
    const demoPass = "Demo12345"
    
    let message = await login(demoEmail, demoPass)
    if (message) {
      await register("متجر معاينة زائر", demoEmail, demoPass, { storeName: "متجر المعاينة التجريبي", phone: "07700000000" })
      message = await login(demoEmail, demoPass)
    }
    setLoading(false)
    if (message) {
      setError(message)
    }
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-white/10 bg-black/40 pr-10 pl-3 text-sm text-white placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"

  const primaryBtn =
    "h-11 w-full rounded-xl bg-primary font-bold text-sm text-white shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"

  const marqueeItems = [
    "رد فوري 24/7",
    "طلبات بلا أخطاء",
    "مخزون لحظي",
    "أرباح واضحة",
    "دعم جميع المحافظات",
    "إنستغرام و واتساب و تيك توك و فيسبوك",
    "بيانات معزولة لكل متجر",
  ]

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-[#08090d] text-foreground flex flex-col relative overflow-hidden font-sans rtl"
    >
      <style>{motionCss}</style>

      <div className="absolute top-1/4 right-1/4 h-125 w-125 rounded-full bg-primary/15 blur-[160px] pointer-events-none ei-glow" />
      <div className="absolute bottom-1/4 left-1/4 h-125 w-125 rounded-full bg-emerald-500/10 blur-[180px] pointer-events-none ei-glow" />

      <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-[#08090d]/70 backdrop-blur-xl">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("preview")}>
            <LogoMark />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">إيليت العراق</h1>
                <span className="hidden sm:inline-block rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/30">
                  منصة المتاجر الذكية
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">Elite Iraq — Smart Social Commerce</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === "preview"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">استكشاف الميزات والمنصة</span>
              <span className="sm:hidden">المنصة</span>
            </button>

            <button
              onClick={() => setActiveTab("auth")}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === "auth"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">تسجيل الدخول / متجر جديد</span>
              <span className="sm:hidden">دخول</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full z-10">
        {activeTab === "preview" ? (
          <div>
            <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              <div className="lg:col-span-7 space-y-6 text-right">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur">
                  <Sparkles className="h-4 w-4" /> الحل الشامل لمتجرك الإلكتروني في العراق
                </span>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                  مشاكل مبيعاتك اليومية.. <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-purple-400 to-emerald-400">
                    حليناهة الك بذكاء واحترافية
                  </span>
                </h2>

                <p className="text-sm sm:text-base text-muted-foreground leading-loose max-w-xl">
                  نحن لا نمنحك مجرد أدوات معقدة، بل نبني لك بيئة عمل ذكية تضمن عدم ضياع أي زبون وتضاعف مبيعاتك بكفاءة عالية على مدار الساعة.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab("auth")}
                    className="h-12 px-7 rounded-xl bg-linear-to-r from-primary via-purple-600 to-indigo-600 font-extrabold text-sm text-white shadow-xl shadow-primary/30 hover:scale-[1.03] transition-all flex items-center gap-2"
                  >
                    <span>ابدأ مجاناً الآن</span>
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <button
                    onClick={handleQuickDemo}
                    className="h-12 px-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold text-sm text-emerald-400 backdrop-blur transition-all flex items-center gap-2"
                  >
                    <Store className="h-4 w-4" />
                    <span>معاينة لوحة تجريبية فورية 🚀</span>
                  </button>
                </div>

                <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    دعم جميع المحافظات العراقية
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ربط إنستغرام وواتساب وتيك توك
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <div className="ei-stage relative h-80 w-[320px] sm:h-95 sm:w-95" aria-hidden="true">
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/30 ei-spin-slow"
                    style={{ width: "calc(var(--r) * 2)", height: "calc(var(--r) * 2)" }}
                  />
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
                    style={{ width: "calc(var(--r) * 1.15)", height: "calc(var(--r) * 1.15)" }}
                  />

                  <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2">
                    <div className="absolute inset-0 rounded-3xl border border-primary/50 ei-ping" />
                    <div className="absolute inset-0 rounded-3xl border border-primary/40 ei-ping-late" />
                  </div>

                  <div className="absolute inset-0 ei-spin">
                    {[
                      { label: "إنستغرام", a: "0deg" },
                      { label: "واتساب", a: "180deg" },
                      { label: "تيك توك", a: "270deg" },
                      { label: "الفيسبوك", a: "90deg" },
                    ].map((c) => (
                      <div
                        key={c.label}
                        className="ei-chip absolute left-1/2 top-1/2 -ml-9.5 -mt-3.75"
                        style={{ ["--a" as string]: c.a }}
                      >
                        <span className="ei-counter flex h-7.5 w-19 items-center justify-center rounded-full border border-white/15 bg-[#0d0f16]/90 text-[11px] font-bold text-white shadow-lg backdrop-blur">
                          {c.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <LogoMark size="lg" />
                  </div>

                  <div className="ei-float absolute -top-1 left-0 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 backdrop-blur">
                    <p className="text-[10px] text-emerald-300/80">استجابة المساعد</p>
                    <p className="text-sm font-bold text-emerald-400">24/7</p>
                  </div>
                  <div className="ei-float-delay absolute -bottom-1 right-0 rounded-2xl border border-primary/30 bg-primary/10 px-3 py-2 backdrop-blur">
                    <p className="text-[10px] text-primary/80">بيانات كل متجر</p>
                    <p className="text-sm font-bold text-primary">معزولة وآمنة</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="w-full border-y border-white/10 bg-white/3 overflow-hidden py-3.5" aria-hidden="true">
              <div className="ei-marquee flex w-max gap-10 text-xs font-bold text-muted-foreground">
                {[...marqueeItems, ...marqueeItems].map((item, i) => (
                  <span key={i} className="flex items-center gap-10 whitespace-nowrap">
                    <span>{item}</span>
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
              <section className="space-y-10">
                <div className="max-w-2xl space-y-3 text-right">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                    شاهد المنصة وهي تعمل
                  </h3>
                  <p className="text-sm text-muted-foreground leading-loose">
                    من أول رسالة يرسلها الزبون إلى تحديث المخزون والأرباح، كل شيء يحدث تلقائياً. اضغط على أي مرحلة لتشاهدها.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                  <ol className="lg:col-span-5 space-y-3">
                    {steps.map((s, i) => {
                      const Icon = s.icon
                      const active = step === i
                      return (
                        <li key={s.title}>
                          <button
                            onClick={() => setStep(i)}
                            className={`relative w-full overflow-hidden rounded-2xl border p-4 text-right flex items-start gap-4 transition-all ${
                              active
                                ? "border-primary/40 bg-primary/10 shadow-lg shadow-primary/5"
                                : "border-white/10 bg-white/3 hover:bg-white/6"
                            }`}
                          >
                            <span
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${
                                active
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-primary/10 text-primary border border-primary/20"
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </span>
                            <span className="flex-1 space-y-1">
                              <span className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-primary">0{i + 1}</span>
                                <span className="text-sm font-bold text-white">{s.title}</span>
                              </span>
                              <span className="block text-xs text-muted-foreground leading-relaxed">{s.text}</span>
                            </span>
                            {active && (
                              <span className="absolute bottom-0 right-0 h-0.75 w-full bg-primary/15">
                                <span key={step} className="ei-fill block h-full w-full bg-primary" />
                              </span>
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ol>

                  <div className="lg:col-span-7">
                    <div className="h-full rounded-3xl border border-white/10 bg-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inset-0 rounded-full bg-emerald-400 ei-ping" />
                            <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400" />
                          </span>
                          <span className="text-xs font-bold text-white">محادثة مباشرة مع زبون</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">مثال توضيحي</span>
                      </div>

                      <div className="flex-1 space-y-4 p-5 min-h-85">
                        <div key={`c-${step === 0}`} className="ei-pop max-w-[85%] rounded-2xl rounded-tr-sm border border-white/10 bg-white/6 px-4 py-3 text-sm text-white leading-relaxed">
                          بكم هذا القميص؟ وتوصلون للبصرة؟
                        </div>

                        {step === 0 && (
                          <div className="ei-pop mr-auto flex w-fit items-center gap-1.5 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
                            <span className="ei-dot h-1.5 w-1.5 rounded-full bg-primary" />
                            <span className="ei-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: ".15s" }} />
                            <span className="ei-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: ".3s" }} />
                          </div>
                        )}

                        {step >= 1 && (
                          <div className="ei-pop mr-auto max-w-[85%] rounded-2xl rounded-tl-sm border border-primary/30 bg-primary/15 px-4 py-3 text-sm text-white leading-relaxed">
                            <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-primary">
                              <Bot className="h-3.5 w-3.5" /> المساعد الذكي
                            </span>
                            أهلاً بك! السعر 25,000 د.ع والتوصيل للبصرة متاح خلال يومين. هل أثبّت لك الطلب؟
                          </div>
                        )}

                        {step >= 2 && (
                          <div className="ei-pop rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
                            <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                              <ClipboardList className="h-4 w-4" /> تم تثبيت الطلب تلقائياً
                            </p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">الاسم</p>
                                <p className="font-bold text-white">علي الكناني</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">المحافظة</p>
                                <p className="font-bold text-white">البصرة</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">الهاتف</p>
                                <p className="font-bold text-white font-mono" dir="ltr">0770 000 0000</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">المنتج</p>
                                <p className="font-bold text-white">قميص كلاسيك</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/10">
                        <div className="bg-[#0b0d13] p-4 space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>المخزون</span>
                            <span className="font-mono font-bold text-white">{step >= 3 ? 11 : 12} قطعة</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-1000"
                              style={{ width: step >= 3 ? "55%" : "60%" }}
                            />
                          </div>
                        </div>
                        <div className="bg-[#0b0d13] p-4 space-y-1">
                          <p className="text-[11px] text-muted-foreground">أرباح اليوم</p>
                          <p className={`text-lg font-bold transition-colors duration-700 ${step >= 3 ? "text-emerald-400" : "text-white/40"}`}>
                            {step >= 3 ? "+25,000 د.ع" : "0 د.ع"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                <article className="md:col-span-2 lg:col-span-2 relative overflow-hidden rounded-3xl p-7 sm:p-8 bg-linear-to-br from-primary/15 via-primary/5 to-transparent border border-primary/40 shadow-xl shadow-primary/5 flex flex-col justify-between gap-6">
                  <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none ei-glow" />
                  <div className="relative space-y-4">
                    <div className="ei-float flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                      <Bot className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground leading-snug">
                      موظف مبيعات ذكي ومحترف لإقناع الزبون
                    </h3>
                    <p className="text-sm text-muted-foreground leading-loose max-w-2xl">
                      نظام ذكاء اصطناعي متطور ومبرمج كخبير مبيعات مخضرم؛ يفهم نفسية الزبون المتردد، يتعامل مع اعتراضاته بحرفية عالية، ويقوده بقوة لإتمام الشراء وتأكيد الطلب.
                    </p>
                  </div>
                  <div className="relative pt-4 border-t border-primary/20 flex items-center gap-2 text-xs font-bold text-primary">
                    <span>✦ مدعوم بذكاء اصطناعي خبير في إغلاق الصفقات</span>
                  </div>
                </article>

                <FeatureCard
                  icon={Zap}
                  title="القضاء على ضياع الزبائن بالرد الفوري (24/7)"
                  text="تأخر الرد على الرسائل والتعليقات يدفع الزبون مباشرة للشراء من منافسك. نوفر لك استجابة فورية وآلية طوال اليوم لحفظ كل فرصة بيع."
                />
                <FeatureCard
                  icon={ClipboardList}
                  title="إنهاء أخطاء تثبيت الطلبات وضياع العناوين"
                  text="ودع الأخطاء البشرية في تسجيل الأسماء والأرقام ومحافظات التوصيل يدوياً؛ النظام يستخرج تفاصيل الطلب من المحادثة ويحولها لبيانات دقيقة وموثوقة."
                />
                <FeatureCard
                  icon={MessageSquare}
                  title="التحرر من إهدار الوقت في الإجابة على الأسئلة المتكررة"
                  text="تخلص من الضغط اليومي في تكرار إجابات الأسئلة الأساسية (بكم؟ وأين التوصيل؟)، حيث يتكفل النظام بالرد الفوري وتوجيه الزبون لإتمام الطلب بنفسه."
                />
                <FeatureCard
                  icon={BarChart3}
                  title="مزامنة المخزون ومتابعة الأرباح بدقة لحظية"
                  text="لوحة تحكم ذكية تحدث كميات بضاعتك تلقائياً مع كل عملية بيع، وتمنحك رؤية صافية ومباشرة لحسابات متجرك."
                />
              </section>

              <section className="rounded-3xl border border-primary/25 bg-linear-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="space-y-5 text-right">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <Calculator className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                    احسب كم يوفر لك المساعد الذكي شهرياً
                  </h3>
                  <p className="text-sm text-muted-foreground">حدد معدل الرسائل اليومية لصفحة متجرك:</p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>عدد رسائل الزبائن اليومية:</span>
                      <span className="text-primary font-mono text-sm">{dailyMessages} رسالة / يومياً</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      value={dailyMessages}
                      onChange={(e) => setDailyMessages(Number(e.target.value))}
                      className="w-full accent-primary h-2 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  <div className="p-5 rounded-2xl border border-white/10 bg-black/40 space-y-1">
                    <p className="text-[11px] text-muted-foreground">الوقت الموفر شهرياً من الردود اليدوية</p>
                    <p className="text-2xl font-bold text-emerald-400">+{savedHours} ساعة عمل/شهرياً</p>
                  </div>
                  <div className="p-5 rounded-2xl border border-white/10 bg-black/40 space-y-1">
                    <p className="text-[11px] text-muted-foreground">طلبات إضافية مُلتقطة من الرد الفوري 24/7</p>
                    <p className="text-2xl font-bold text-primary">+{extraSales} طلب إضافي/شهرياً</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-3 text-white font-medium">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  </span>
                  <span>خصوصية البيانات محمية بالكامل لكل متجر بشكل معزول</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>✓ دعم جميع المحافظات العراقية</span>
                  <span>✓ ربط إنستغرام وواتساب وتيك توك</span>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto my-10 sm:my-16 px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-5 overflow-hidden rounded-3xl border border-white/10 bg-card/60 backdrop-blur-2xl shadow-2xl">
              <aside className="hidden md:flex md:col-span-2 relative flex-col justify-between gap-8 p-8 bg-linear-to-br from-primary/20 via-primary/5 to-transparent border-l border-white/10 overflow-hidden">
                <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none ei-glow" />

                <div className="relative space-y-6">
                  <div className="relative h-24 w-24">
                    <div className="absolute inset-0 rounded-3xl border border-primary/50 ei-ping" />
                    <div className="absolute inset-0 rounded-3xl border border-primary/40 ei-ping-late" />
                    <div className="ei-float">
                      <LogoMark size="lg" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-extrabold text-white leading-snug">
                    {isRegistering ? "ابدأ متجرك الذكي اليوم" : "أهلاً بعودتك إلى متجرك"}
                  </h3>
                </div>

                <div className="relative space-y-3">
                  <div key={step} className="ei-pop rounded-2xl border border-white/10 bg-black/30 p-4 space-y-1.5">
                    <p className="flex items-center gap-2 text-xs font-bold text-white">
                      {(() => {
                        const Icon = steps[step].icon
                        return <Icon className="h-4 w-4 text-primary" />
                      })()}
                      {steps[step].title}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{steps[step].text}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {steps.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1 rounded-full transition-all duration-500 ${
                          i === step ? "w-8 bg-primary" : "w-3 bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </aside>

              <div className="md:col-span-3 p-6 sm:p-9 space-y-6">
                <div className="space-y-1 text-right">
                  <h2 className="text-xl font-bold text-white">
                    {isRegistering ? "إنشاء متجر جديد" : "تسجيل الدخول إلى متجرك"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    اختر طريقة الدخول المفضلّة لديك للوصول للوحة التحكم
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold">
                  <button
                    onClick={() => { setAuthMethod("email"); setError(null) }}
                    className={`py-2.5 rounded-lg transition-all ${authMethod === "email" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-white"}`}
                  >
                    البريد
                  </button>
                  <button
                    onClick={() => { setAuthMethod("phone"); setError(null) }}
                    className={`py-2.5 rounded-lg transition-all ${authMethod === "phone" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-white"}`}
                  >
                    رقم الهاتف
                  </button>
                  <button
                    onClick={() => { setAuthMethod("google"); setError(null) }}
                    className={`py-2.5 rounded-lg transition-all ${authMethod === "google" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-white"}`}
                  >
                    Google
                  </button>
                </div>

                {error && (
                  <div className="rounded-xl bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 1. الدخول بالبريد ورقم المرور */}
                {authMethod === "email" && (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    {isRegistering && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground block">اسم المتجر</label>
                        <div className="relative">
                          <Store className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            required
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            placeholder="مثال: متجر الأناقة"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground block">البريد الإلكتروني الشخصي</label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground block">كلمة المرور</label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className={primaryBtn}>
                      {loading ? "جارٍ الحفظ والتحقق..." : isRegistering ? "إنشاء الحساب والمتجر" : "دخول إلى لوحة التحكم"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRegistering(!isRegistering)}
                      className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors pt-1"
                    >
                      {isRegistering ? "لديك حساب بالفعل؟ تسجيل الدخول" : "ليس لديك حساب؟ إنشاء متجر جديد"}
                    </button>
                  </form>
                )}

                {/* 2. الدخول برقم الهاتف العراقي */}
                {authMethod === "phone" && (
                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    {!otpSent ? (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground block">رقم الهاتف العراقي</label>
                        <div className="relative">
                          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0770XXXXXXX أو 0780XXXXXXX"
                            className={`${inputClass} font-mono dir-ltr text-right`}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground block">رمز التحقق المرسل لهاتفك</label>
                        <input
                          type="text"
                          required
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="أدخل الرمز المكون من 6 أرقام"
                          className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-center text-base tracking-widest text-white font-mono outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
                        />
                      </div>
                    )}

                    <button type="submit" disabled={loading} className={primaryBtn}>
                      {loading ? "جارٍ التحقق..." : !otpSent ? "إرسال رمز التحقق SMS" : "تأكيد والدخول للوحة المتجر"}
                    </button>
                  </form>
                )}

                {/* 3. الدخول بواسطة حساب Google */}
                {authMethod === "google" && (
                  <div className="space-y-4 text-center">
                    <p className="text-xs text-muted-foreground leading-loose">
                      سجل الدخول مباشرة باستخدام حساب Google الخاص بك مع حماية بيانات متجرك
                    </p>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 font-bold text-sm text-white transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>{loading ? "جاري التحويل..." : "متابعة باستخدام حساب Google"}</span>
                    </button>
                  </div>
                )}

                <div className="pt-5 border-t border-white/10 space-y-2 text-center">
                  <button
                    type="button"
                    onClick={handleQuickDemo}
                    className="w-full h-10 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-400 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>أو دخول مباشر بمتجر تجريبي معزول 🚀</span>
                  </button>
                  <p className="text-[10px] text-muted-foreground">
                    البيانات في الحساب التجريبي معزولة ومخصصة للاستكشاف فقط.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full border-t border-white/5 z-20">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-[11px] text-muted-foreground flex flex-wrap justify-between items-center gap-3">
          <span>© 2026 جميع الحقوق محفوظة لـ إيليت العراق (Elite Iraq)</span>
          <div className="flex gap-5">
            <button onClick={() => setShowPrivacyModal(true)} className="hover:text-white transition-colors cursor-pointer">
              سياسة الخصوصية وعزل البيانات
            </button>
            <button onClick={() => setShowTermsModal(true)} className="hover:text-white transition-colors cursor-pointer">
              شروط الخدمة
            </button>
          </div>
        </div>
      </footer>

      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="ei-pop w-full max-w-md rounded-3xl border border-white/10 bg-card p-6 shadow-2xl space-y-5 rtl text-right">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </span>
                سياسة الخصوصية وعزل المتاجر (Multi-Tenant)
              </h3>
              <button onClick={() => setShowPrivacyModal(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-muted-foreground leading-loose">
              <p>1. تتمتع جميع المتاجر المسجلة ببيئة معزولة بالكامل (Tenant Sandbox)؛ حيث لا يمكن لتاجر آخر الاطلاع على مبيعاتك، زبائنك، أو منتجاتك.</p>
              <p>2. لا نقوم بمشاركة أي أرقام هواتف أو عناوين مع جهات خارجية.</p>
              <p>3. يتم تشفير كافة المحادثات والبيانات الحساسة لضمان أمان تجارتك.</p>
            </div>
            <button onClick={() => setShowPrivacyModal(false)} className="w-full h-10 rounded-xl bg-primary text-xs font-bold text-white hover:opacity-90 transition-all">
              فهمت ذلك
            </button>
          </div>
        </div>
      )}

      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="ei-pop w-full max-w-md rounded-3xl border border-white/10 bg-card p-6 shadow-2xl space-y-5 rtl text-right">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </span>
                شروط استخدام منصة إيليت العراق
              </h3>
              <button onClick={() => setShowTermsModal(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-muted-foreground leading-loose">
              <p>1. يُمنع استخدام المنصة لإرسال رسائل عشوائية أو ترويجية مزعجة (Spam).</p>
              <p>2. التاجر مسؤول عن صحة أسعار المنتجات المرفوعة في كتالوج متجره.</p>
              <p>3. نوفر دعماً فنياً يومياً لمساعدة التاجر في ضبط وتطوير أداء المساعد الذكي.</p>
            </div>
            <button onClick={() => setShowTermsModal(false)} className="w-full h-10 rounded-xl bg-primary text-xs font-bold text-white hover:opacity-90 transition-all">
              موافق
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  text: string
}) {
  return (
    <article className="rounded-3xl p-6 sm:p-7 bg-card/50 hover:bg-card border border-border/60 hover:border-primary/30 transition-colors duration-300 flex flex-col gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-bold text-foreground leading-snug">{title}</h3>
      <p className="text-sm text-muted-foreground leading-loose">{text}</p>
    </article>
  )
}