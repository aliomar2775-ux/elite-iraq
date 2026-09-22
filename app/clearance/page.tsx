"use client"

import { useState } from "react"
import { AppShell } from "@/components/app/app-shell"
import { PageHeader } from "@/components/app/page-header"
import {
  Percent,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react"

export default function ClearancePage() {
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [phone, setPhone] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [otpSent, setOtpSent] = useState(false)

  const [deals, setDeals] = useState([
    { id: "1", name: "ساعة Ultra Smart Series 8", days: 9, oldPrice: 45000, newPrice: 35000, qty: 4 }
  ])

  const [name, setName] = useState("")
  const [oldPrice, setOldPrice] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [days, setDays] = useState("48")
  const [qty, setQty] = useState("")

  const handleVerifyPhone = (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpSent) {
      if (!/^(0)?(77|78|79|75)\d{8}$/.test(phone.replace(/\D/g, ""))) {
        alert("يرجى إدخال رقم هاتف عراقي صحيح (زين، أسياسيل، كورك)")
        return
      }
      setOtpSent(true)
    } else {
      if (otpCode !== "1234") {
        alert("رمز التحقق التجريبي هو 1234")
        return
      }
      setPhoneVerified(true)
    }
  }

  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !oldPrice || !newPrice || !qty) return

    setDeals([
      {
        id: Date.now().toString(),
        name,
        days: 7,
        oldPrice: Number(oldPrice),
        newPrice: Number(newPrice),
        qty: Number(qty)
      },
      ...deals
    ])
    setName("")
    setOldPrice("")
    setNewPrice("")
    setQty("")
  }

  const handleDeleteDeal = (id: string) => {
    setDeals(deals.filter((d) => d.id !== id))
  }

  return (
    <AppShell>
      <div className="space-y-6 rtl">
        <PageHeader
          title="العروض الخاصة وتصفية البضائع الراكدة"
          subtitle="إدارة المنتجات التي تجاوزت 7 أيام بالمخزون وإنشاء عروض تصفية فورية"
        />

        {/* حالة توثيق رقم هاتف التاجر */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">تنبيهات البوت الفورية (WhatsApp / SMS)</h3>
            <p className="text-xs text-muted-foreground">يتطلب توثيق رقم هاتفك لتلقي إشعارات التصفية التلقائية للبضاعة الراكدة.</p>
          </div>
          {phoneVerified ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="h-4 w-4" /> الرقم موثق ({phone || "07712345678"})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/30">
              <Phone className="h-4 w-4" /> يتطلب التوثيق 🔔
            </span>
          )}
        </div>

        {!phoneVerified && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="h-5 w-5" />
              تفعيل تنبيهات البوت على هاتفك العراقي
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              لتلقي رسائل فورية من البوت عندما يتوقف بيع أي بضاعة لأكثر من أسبوع، يرجى إدخال وتأكيد رقم هاتفك:
            </p>
            <form onSubmit={handleVerifyPhone} className="flex flex-wrap items-center gap-3">
              {!otpSent ? (
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07701234567"
                  className="h-10 px-3 rounded-xl border border-white/10 bg-background text-xs font-mono outline-none focus:border-emerald-500"
                />
              ) : (
                <input
                  type="text"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="رمز التجربة: 1234"
                  className="h-10 px-3 rounded-xl border border-white/10 bg-background text-xs text-center font-mono outline-none focus:border-emerald-500"
                />
              )}
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-emerald-600 font-bold text-xs text-white hover:bg-emerald-500 transition-all"
              >
                {!otpSent ? "إرسال رمز SMS" : "تأكيد التوثيق ✓"}
              </button>
            </form>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-center gap-3 text-xs text-foreground">
          <Sparkles className="h-5 w-5 text-primary shrink-0" />
          <span>
            <strong>توصية المساعد الذكي:</strong> تم رصد منتجات تجاوزت 7 أيام بالمخزون. يمكنك تصفيتها الآن عبر النموذج أدناه لخلق فرصة بيع أسرع لعملاء المتجر.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleAddDeal} className="space-y-4 p-5 rounded-2xl border border-border bg-card">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-500" /> إنشاء عرض تصفية جديد
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">اسم المنتج (الراكد)</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: ساعة Ultra Smart Series 8"
                className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">السعر الأصلي (د.ع)</label>
                <input
                  type="number"
                  required
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value)}
                  placeholder="45000"
                  className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-mono outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">سعر العرض (د.ع)</label>
                <input
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="35000"
                  className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-mono outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">مدة العرض</label>
                <input
                  type="text"
                  required
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="48 ساعة"
                  className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">الكمية المتاحة بالعرض</label>
                <input
                  type="number"
                  required
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="5"
                  className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-mono outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-emerald-600 font-bold text-xs text-white hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
            >
              نشر العرض وتفعيل التنبيهات 🚀
            </button>
          </form>

          <div className="space-y-3 p-5 rounded-2xl border border-border bg-card">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> العروض النشطة بالمخزون ({deals.length})
            </h3>

            <div className="space-y-3 max-h-90 overflow-y-auto pr-1">
              {deals.map((d) => (
                <div key={d.id} className="p-3.5 rounded-xl border border-border bg-background space-y-2 text-xs relative group">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{d.name}</span>
                    <span className="text-[10px] bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded font-mono border border-amber-500/20">
                      راكدة منذ {d.days} أيام
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>
                      السعر: <span className="line-through">{d.oldPrice.toLocaleString("ar-IQ")}</span> ➔{" "}
                      <strong className="text-emerald-500">{d.newPrice.toLocaleString("ar-IQ")} د.ع</strong>
                    </span>
                    <span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                      الكمية: {d.qty}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteDeal(d.id)}
                    className="absolute top-2 left-2 p-1 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="حذف العرض"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}