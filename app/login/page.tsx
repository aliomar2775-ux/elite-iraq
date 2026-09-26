"use client"

/**
 * ============================================================================
 * منصة إيليت العراق (Elite Iraq) — صفحة تسجيل الدخول والتعريف بالمنصة
 * ============================================================================
 */

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useApp, LOCAL_OTP } from "@/lib/app-state"
import {
  Sparkles,
  Bot,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Lock,
  User,
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
  RefreshCcw,
} from "lucide-react"

// --------------------------------------------------------------------------
// الحركات (Keyframes)
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
  const { login, loginWithPhone, sendLocalOtp, resetPasswordByPhoneOrUsername, register } = useApp()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<"preview" | "auth">("preview")
  const [authMethod, setAuthMethod] = useState<"username" | "phone">("username")
  const [isRegistering, setIsRegistering] = useState(false)
  const [isForgotPass, setIsForgotPass] = useState(false)

  // حقول الإدخال
  const [identifier, setIdentifier] = useState("") // اسم المستخدم أو البريد
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [storeName, setStoreName] = useState("")
  const [newPassword, setNewPassword] = useState("")

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

  // 1. تسجيل الدخول أو التسجيل باسم المستخدم/الإيميل
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isRegistering) {
        if (!storeName.trim() || !identifier.trim() || !password.trim()) {
          setError("يرجى ملء جميع الحقول المطلوبة")
          setLoading(false)
          return
        }
        const fakeEmail = `${identifier.trim().toLowerCase()}@elite.iq`
        const err = await register(identifier, fakeEmail, password, { storeName })
        if (err) {
          setError(err)
        } else {
          router.replace("/admin")
        }
      } else {
        const err = await login(identifier, password)
        if (err) {
          setError(err)
        } else {
          router.replace("/admin")
        }
      }
    } catch (err: any) {
      setError("حدث خطأ غير متوقع")
    } finally {
      setLoading(false)
    }
  }

  // 2. تسجيل الدخول عبر رقم الهاتف ورمز التحقق OTP
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!otpSent) {
        const err = await sendLocalOtp(phone)
        if (err) {
          setError(err)
        } else {
          setOtpSent(true)
          alert(`تم إرسال كود التحقق التجريبي لهاتفك: ${LOCAL_OTP}`)
        }
      } else {
        const err = await loginWithPhone(phone, otpCode)
        if (err) {
          setError(err)
        } else {
          router.replace("/admin")
        }
      }
    } catch (err: any) {
      setError("فشل التحقق من رقم الهاتف")
    } finally {
      setLoading(false)
    }
  }

  // 3. استعادة كلمة المرور (نسيت الرمز)
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const err = await resetPasswordByPhoneOrUsername(identifier, newPassword)
      if (err) {
        setError(err)
      } else {
        alert("تم تغيير الرمز بنجاح! يمكنك تسجيل الدخول الآن.")
        setIsForgotPass(false)
        setNewPassword("")
        setPassword("")
      }
    } catch (err: any) {
      setError("فشل تحديث الرمز")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemo = async () => {
    setLoading(true)
    setError(null)
    const err = await login(process.env.NEXT_PUBLIC_ADMIN_EMAIL || "demo@elite.iq", process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Elite123")
    setLoading(false)
    if (err) {
      setError(err)
    } else {
      router.replace("/admin")
    }
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-white/10 bg-black/40 pr-10 pl-3 text-sm text-white placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15 text-right"

  const primaryBtn =
    "h-11 w-full rounded-xl bg-primary font-bold text-sm text-white shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"

  const marqueeItems = [
    "رد فوري 24/7",
    "طلبات بلا أخطاء",
    "مخزون لحظي",
    "أرباح واضحة",
    "دعم جميع المحافظات",
    "إنستغرام وواتساب وتيك توك",
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
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
                    className="h-12 px-7 rounded-xl bg-linear-to-r from-primary via-purple-600 to-indigo-600 font-extrabold text-sm text-white shadow-xl shadow-primary/30 hover:scale-[1.03] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>ابدأ مجاناً الآن</span>
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <button
                    onClick={handleQuickDemo}
                    className="h-12 px-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold text-sm text-emerald-400 backdrop-blur transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Store className="h-4 w-4" />
                    <span>معاينة لوحة تجريبية فورية </span>
                  </button>
                </div>
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

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <LogoMark size="lg" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto my-12 sm:my-16 px-4">
            <div className="rounded-3xl border border-white/10 bg-card/80 backdrop-blur-2xl shadow-2xl p-6 sm:p-8 space-y-6">
              
              <div className="text-center space-y-1">
                <div className="flex justify-center mb-3">
                  <LogoMark />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {isForgotPass ? "استعادة كلمة المرور" : isRegistering ? "إنشاء متجر جديد" : "تسجيل الدخول"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isForgotPass ? "أدخل اسم المستخدم أو هاتفك لتعيين رمز جديد" : "منصة إيليت العراق — تحكم كامل بمتجرك"}
                </p>
              </div>

              {/* أزرار اختيار طريقة الدخول */}
              {!isForgotPass && (
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => { setAuthMethod("username"); setError(null) }}
                    className={`py-2.5 rounded-lg transition-all cursor-pointer ${authMethod === "username" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-white"}`}
                  >
                    اسم المستخدم
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMethod("phone"); setError(null) }}
                    className={`py-2.5 rounded-lg transition-all cursor-pointer ${authMethod === "phone" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-white"}`}
                  >
                    رقم الهاتف (OTP)
                  </button>
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* نموذج 1: الدخول أو التسجيل باسم المستخدم */}
              {authMethod === "username" && !isForgotPass && (
                <form onSubmit={handleUsernameSubmit} className="space-y-4">
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
                          placeholder="مثال: متجر الكفاح"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground block">اسم المستخدم أو البريد</label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="اسم المستخدم أو الإيميل"
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

                  {!isRegistering && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => { setIsForgotPass(true); setError(null); }}
                        className="text-xs text-amber-400 hover:underline cursor-pointer"
                      >
                        نسيت الرمز؟
                      </button>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className={primaryBtn}>
                    {loading ? "جارٍ التنفيذ..." : isRegistering ? "إنشاء المتجر الجديد" : "تسجيل الدخول"}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
                    className="w-full text-center text-xs text-muted-foreground hover:text-white transition-colors pt-2 cursor-pointer"
                  >
                    {isRegistering ? "لديك حساب؟ تسجيل الدخول" : "ليس لديك حساب؟ افتح متجراً جديداً"}
                  </button>
                </form>
              )}

              {/* نموذج 2: تسجيل الدخول عبر الهاتف */}
              {authMethod === "phone" && !isForgotPass && (
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
                          placeholder="0770XXXXXXX"
                          className={`${inputClass} font-mono dir-ltr text-right`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground block">أدخل كود التحقق (الرمز التجريبي: 123456)</label>
                      <input
                        type="text"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-center text-base tracking-widest text-white font-mono outline-none focus:border-primary"
                      />
                    </div>
                  )}

                  <button type="submit" disabled={loading} className={primaryBtn}>
                    {loading ? "جارٍ المعالجة..." : !otpSent ? "إرسال كود التحقق SMS" : "تأكيد الدخول"}
                  </button>
                </form>
              )}

              {/* نموذج 3: استعادة الرمز ("نسيت الرمز") */}
              {isForgotPass && (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground block">اسم المستخدم أو رقم الهاتف للحساب</label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="اسم المستخدم أو الهاتف"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground block">الرمز السري الجديد</label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className={primaryBtn}>
                    {loading ? "جارٍ الحفظ..." : "حفظ الرمز الجديد"}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsForgotPass(false); setError(null); }}
                    className="w-full text-center text-xs text-muted-foreground hover:text-white transition-colors pt-2 cursor-pointer"
                  >
                    العودة لتسجيل الدخول
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="w-full h-10 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-400 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>دخول مباشر كأدمن / متجر تجريبي 🚀</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </main>

      <footer className="w-full border-t border-white/5 z-20">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-[11px] text-muted-foreground flex justify-between items-center">
          <span>© 2026 جميع الحقوق محفوظة لـ إيليت العراق (Elite Iraq)</span>
        </div>
      </footer>
    </div>
  )
}