"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Store, Loader2, AlertCircle, Phone, Mail, ArrowLeft, UserCheck } from "lucide-react"
import { LOCAL_OTP, useApp } from "@/lib/app-state"
import { cn } from "@/lib/utils"

export function LoginForm() {
  const { login, loginWithPhone, sendLocalOtp, register } = useApp()
  const router = useRouter()

  // نمط التسجيل: بريد إلكتروني أو رقم هاتف
  const [authMode, setAuthMode] = useState<"email" | "phone">("email")

  // حالات البريد وكلمة المرور (تبدأ فارغة تماماً لضمان عدم الدخول التلقائي كأدمن)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // حالات الدخول برقم الهاتف
  const [phone, setPhone] = useState("07701230000")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  // 👈 دخول تجريبي بحساب عادي ومقيد تماماً (ليس أدمن)
  const fillSandboxDemo = async () => {
    setPending(true)
    setError(null)
    const demoEmail = "sandbox@elite.iq"
    const demoPass = "Demo12345"
    
    // محاولة تسجيل الدخول بحساب تجريبي عادي، وإن لم يكن موجوداً يتم إنشاؤه تلقائياً
    let message = await login(demoEmail, demoPass)
    if (message) {
      await register("متجر تجريبي زائر", demoEmail, demoPass, { storeName: "متجر المعاينة", phone: "07700000000" })
      message = await login(demoEmail, demoPass)
    }

    setPending(false)
    if (message) {
      setError(message)
      return
    }
    router.replace("/")
  }

  // معالجة الدخول بالبريد
  async function onSubmitEmail(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const message = await login(email, password)
    setPending(false)
    if (message) {
      setError(message)
      return
    }
    router.replace("/")
  }

  // طلب رمز الـ OTP للهاتف
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const err = await sendLocalOtp(phone)
    setPending(false)
    if (err) {
      setError(err)
      return
    }
    setOtpSent(true)
  }

  // معالجة الدخول بالهاتف والـ OTP
  async function onSubmitPhone(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const message = await loginWithPhone(phone, otp)
    setPending(false)
    if (message) {
      setError(message)
      return
    }
    router.replace("/")
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm rtl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">تسجيل الدخول</h1>
            <p className="text-xs text-muted-foreground mt-0.5">إيليت العراق — منصة التجارة الاجتماعية</p>
          </div>
        </div>
      </div>

      {/* تبويب اختيار طريقة تسجيل الدخول */}
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-muted/40 p-1 border border-border/60">
        <button
          type="button"
          onClick={() => {
            setAuthMode("email")
            setError(null)
          }}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer",
            authMode === "email"
              ? "bg-background text-foreground shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Mail className="h-3.5 w-3.5" />
          البريد الإلكتروني
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode("phone")
            setError(null)
          }}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer",
            authMode === "phone"
              ? "bg-background text-foreground shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Phone className="h-3.5 w-3.5" />
          رقم الهاتف (OTP)
        </button>
      </div>

      {/* نموذج البريد وكلمة المرور */}
      {authMode === "email" ? (
        <form onSubmit={onSubmitEmail} className="space-y-4">
          <label className="block text-xs font-medium">
            <span className="mb-1.5 block text-muted-foreground">البريد الإلكتروني</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@elite.iq"
              className="h-11 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none transition-colors focus:border-ring focus:bg-background text-foreground"
            />
          </label>
          <label className="block text-xs font-medium">
            <span className="mb-1.5 block text-muted-foreground">كلمة المرور</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none transition-colors focus:border-ring focus:bg-background text-foreground"
            />
          </label>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="h-11 w-full rounded-lg bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جارٍ الدخول...</span>
              </>
            ) : (
              <span>دخول إلى لوحة المتجر</span>
            )}
          </button>
        </form>
      ) : (
        /* نموذج رقم الهاتف والـ OTP */
        <form onSubmit={!otpSent ? handleSendOtp : onSubmitPhone} className="space-y-4">
          <label className="block text-xs font-medium">
            <span className="mb-1.5 block text-muted-foreground">رقم الهاتف العراقي</span>
            <input
              type="tel"
              required
              disabled={otpSent}
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0770XXXXXXX"
              className="h-11 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm font-mono outline-none transition-colors focus:border-ring focus:bg-background text-foreground disabled:opacity-60"
            />
          </label>

          {otpSent && (
            <label className="block text-xs font-medium space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">رمز التحقق (OTP)</span>
                <span className="text-[10px] text-primary font-mono font-bold">الرمز التجريبي: {LOCAL_OTP}</span>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="أدخل 123456"
                className="h-11 w-full text-center tracking-widest font-mono font-bold rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none transition-colors focus:border-ring focus:bg-background text-foreground"
              />
            </label>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2">
            {!otpSent ? (
              <button
                type="submit"
                disabled={pending}
                className="h-11 w-full rounded-lg bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
              >
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>جارٍ إرسال الرمز...</span>
                  </>
                ) : (
                  <span>إرسال رمز التأكيد</span>
                )}
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={pending}
                  className="h-11 flex-1 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>جارٍ التحقق...</span>
                    </>
                  ) : (
                    <span>تأكيد والدخول</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false)
                    setOtp("")
                    setError(null)
                  }}
                  className="h-11 rounded-lg border border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  تغيير الرقم
                </button>
              </>
            )}
          </div>
        </form>
      )}

      {/* زر المعاينة التجريبية الآمنة (بدون صلاحيات أدمن) */}
      <div className="mt-5 rounded-xl border border-border bg-muted/30 p-3 text-center">
        <p className="text-xs text-muted-foreground mb-2">تريد تجربة المنصة كمستخدم عادي؟</p>
        <button
          type="button"
          onClick={fillSandboxDemo}
          disabled={pending}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
        >
          <UserCheck className="h-4 w-4 text-emerald-500" />
          <span>الدخول بوضع المعاينة التجريبية (بدون أدمن)</span>
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="font-bold text-primary hover:underline inline-flex items-center gap-1">
          <span>إنشاء متجر جديد</span>
          <ArrowLeft className="h-3 w-3" />
        </Link>
      </p>
    </div>
  )
}