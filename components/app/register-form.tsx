"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Store, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { useApp } from "@/lib/app-state"

export function RegisterForm() {
  const { register } = useApp()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("يرجى إدخال اسمك الكامل")
      return
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل")
      return
    }

    setPending(true)
    const message = await register(name.trim(), email.trim(), password)
    setPending(false)

    if (message) {
      setError(message)
      return
    }

    router.replace("/onboarding")
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm rtl">
      <div className="mb-6 flex items-center gap-3 border-b border-border/60 pb-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow-sm">
          <Store className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">إنشاء حساب تاجر جديد</h1>
          <p className="text-xs text-muted-foreground mt-0.5">ابدأ متجرك بالدينار العراقي (IQD) خلال دقائق</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-xs font-medium">
          <span className="mb-1.5 block text-muted-foreground">اسم التاجر / صاحب المتجر *</span>
          <input
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: أحمد الدليمي"
            className="h-11 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none transition-colors focus:border-primary focus:bg-background text-foreground"
          />
        </label>

        <label className="block text-xs font-medium">
          <span className="mb-1.5 block text-muted-foreground">البريد الإلكتروني *</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@elite.iq"
            className="h-11 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none transition-colors focus:border-primary focus:bg-background text-foreground"
          />
        </label>

        <label className="block text-xs font-medium">
          <span className="mb-1.5 block text-muted-foreground">كلمة المرور *</span>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none transition-colors focus:border-primary focus:bg-background text-foreground"
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
          className="h-11 w-full rounded-lg bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>جارٍ إنشاء الحساب...</span>
            </>
          ) : (
            <span>إنشاء الحساب والانتقال للإعداد</span>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-muted-foreground pt-4 border-t border-border/60">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="font-bold text-primary hover:underline inline-flex items-center gap-1">
          <span>تسجيل الدخول</span>
          <ArrowLeft className="h-3 w-3" />
        </Link>
      </p>
    </div>
  )
}