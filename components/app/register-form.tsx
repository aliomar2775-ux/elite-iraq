"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Store } from "lucide-react"
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
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون ٦ أحرف على الأقل")
      return
    }
    setPending(true)
    setError(null)
    const message = await register(name, email, password)
    setPending(false)
    if (message) {
      setError(message)
      return
    }
    router.replace("/onboarding")
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Store className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight">إنشاء حساب تاجر</h1>
          <p className="text-sm text-muted-foreground">ابدأ متجرك بالدينار العراقي خلال دقائق</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">اسمك</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none focus:border-ring focus:bg-background"
          />
        </label>
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
          {pending ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        لديك حساب؟{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  )
}
