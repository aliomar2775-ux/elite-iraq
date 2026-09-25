"use client"

import { useApp } from "@/lib/app-state"
import { AdminView } from "@/components/app/admin-view"
import { AlertTriangle, Loader2 } from "lucide-react"

export default function AdminPage() {
  const { ready, isAdmin } = useApp()

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  // حماية صارمة: نعتمد على isAdmin القادمة من app-state (مصدر حقيقة واحد)
  if (!isAdmin) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center text-center p-6 rtl">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">عذراً، هذه الصفحة غير موجودة</h1>
        <p className="text-muted-foreground text-sm">ليس لديك صلاحية للوصول إلى هذه المنطقة.</p>
      </div>
    )
  }

  return <AdminView />
}