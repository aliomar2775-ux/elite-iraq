"use client"

import { useApp } from "@/lib/app-state"
import { useRouter } from "next/navigation"
import { ShieldCheck } from "lucide-react"

export function ImpersonationBar() {
  const { impersonatorId, merchant, adminReturnToAdmin } = useApp()
  const router = useRouter()

  if (!impersonatorId) return null

  return (
    <div className="fixed bottom-4 inset-x-0 z-[60] flex justify-center px-4 rtl">
      <div className="flex items-center gap-3 bg-amber-500 text-black rounded-2xl px-4 py-2.5 shadow-xl text-xs font-bold max-w-full border border-amber-400">
        <ShieldCheck className="h-4 w-4 shrink-0 text-black" />
        <span className="truncate">
          أنت تتصفح متجر "{merchant?.storeName || "بدون اسم"}" بصفتك أدمن
        </span>
        <button
          type="button"
          onClick={() => {
            adminReturnToAdmin()
            router.replace("/admin")
          }}
          className="bg-black text-amber-400 hover:bg-black/80 px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0"
        >
          العودة لوحة الأدمن
        </button>
      </div>
    </div>
  )
}