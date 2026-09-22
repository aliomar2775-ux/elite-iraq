"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Store } from "lucide-react"
import { DEMO_EMAIL, DEMO_PASSWORD, useApp } from "@/lib/app-state"

export function LoginForm() {
  const { login } = useApp()
  const router = useRouter()
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
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

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Store className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight">تسجيل الدخول</h1>
          <p className="text-sm text-muted-foreground">إيليت العراق — منصة التجارة الاجتماعية</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">البريد الإلكتروني</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none focus:border-ring focus:bg-background"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">كلمة المرور</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none focus:border-ring focus:bg-background"
          />
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "جارٍ الدخول..." : "دخول إلى لوحة المتجر"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        حساب تجريبي جاهز: {DEMO_EMAIL} / {DEMO_PASSWORD}
      </p>
      <p className="mt-2 text-center text-sm">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          إنشاء متجر جديد
        </Link>
      </p>
    </div>
  )
}
