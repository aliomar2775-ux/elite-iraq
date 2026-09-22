"use client"

import { useState } from "react"
import { Check, CreditCard, Calendar, Download, Zap, Building2, ShieldCheck, ArrowRightLeft } from "lucide-react"
import { invoices as seedInvoices, planUsage, plans } from "@/lib/data"
import { formatIQD } from "@/lib/iraq"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/app-state"

export function BillingView() {
  const { merchant, upgradePlan } = useApp()
  const [invoices, setInvoices] = useState(seedInvoices)

  // الباقة الحالية للتاجر بناءً على الحالة المركزية أو الخطة الافتراضية
  const currentPlanId = merchant?.activePlanId ?? "growth"
  const currentPlan = plans.find((p) => p.id === currentPlanId) ?? plans[1]

  const handleUpgrade = (planId: string) => {
    upgradePlan(planId)
    alert("تم محاكاة الترقية بنجاح! تم تجديد رصيد الذكاء الاصطناعي Gemini وتفعيل خيارات مساحة العمل الجديدة.")
  }

  const handleDownloadInvoice = (invId: string) => {
    alert(`تم تجهيز تحميل الفاتورة رقم ${invId} بفرمتة PDF الرسمية.`)
  }

  return (
    <div className="space-y-6">
      {/* شريط تعريف مساحة العمل المعزولة (Multi-Tenant Context) */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm">{merchant?.storeName || "متجر إليت العراق"}</h2>
              <span className="rounded-md bg-background px-2 py-0.5 text-[10px] font-mono font-medium border border-border">
                Tenant ID: ws_iq_8921
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              مساحة عمل معزولة لقواعد البيانات والمحادثات لمتجرك الحالي
            </p>
          </div>
        </div>

        <button
          onClick={() => alert("يمكنك إضافة متجر جديد أو التبديل بين متاجر كجزء من نظام Multi-Tenancy.")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          إدارة المتاجر المربوطة
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* قسم تفاصيل الباقة واستهلاك الموارد */}
        <section className="rounded-xl border border-border bg-card p-6 lg:col-span-2 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  الخطة الحالية
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground font-medium">
                  <Zap className="h-3 w-3 text-amber-500" />
                  {currentPlan.aiModel === "gemini-2.5-pro" ? "Gemini 2.5 Pro (عالي الذكاء)" : "Gemini 2.5 Flash (سريع)"}
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">{currentPlan.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {currentPlan.tagline} · تجديد الاشتراك القادم تلقائياً في 1 أكتوبر 2026
              </p>
            </div>
            <div className="text-left">
              <p className="text-3xl font-bold tracking-tight text-primary">
                {formatIQD(currentPlan.price)} <span className="text-xs font-normal text-muted-foreground">/ شهرياً</span>
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {planUsage.map((u) => {
              const pct = Math.round((u.used / u.total) * 100)
              const high = pct >= 80
              return (
                <div key={u.label} className="rounded-lg border border-border p-4 bg-muted/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{u.label}</span>
                    <span className="font-semibold">
                      {u.used.toLocaleString("ar-EG")} / {u.total.toLocaleString("ar-EG")} {u.unit}
                    </span>
                  </div>
                  <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all duration-300", high ? "bg-amber-500" : "bg-primary")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* قسم بوابة الدفع المحلية والحسابات المعتمدة */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-semibold text-sm tracking-tight">طريقة الدفع المربوطة</h2>
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-border p-4 bg-muted/20">
            <span className="flex h-10 w-12 items-center justify-center rounded-md bg-primary/15 text-primary shrink-0">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold">زين كاش / سوبر كي •••• 4291</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <ShieldCheck className="h-3 w-3 text-emerald-500" /> حساب محلي معتمد في العراق
              </p>
            </div>
          </div>
          <button
            onClick={() => alert("بوابة الدفع الإلكتروني (زين كاش / سوبر كي / فاست باي) جاهزة لربط الحساب!")}
            className="mt-3 w-full rounded-lg border border-border py-2 text-xs font-semibold transition-colors hover:bg-muted"
          >
            تحديث طريقة الدفع
          </button>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            التجديد الآلي القادم: 1 أكتوبر 2026
          </div>
        </section>
      </div>

      {/* قسم اختيار باقات الاشتراك مع نموذج Gemini */}
      <section>
        <h2 className="mb-4 font-semibold tracking-tight text-base">خطط الاشتراك ونماذج Gemini AI المتاحة</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {plans.map((p) => {
            const isCurrent = p.id === currentPlanId
            return (
              <div
                key={p.id}
                className={cn(
                  "flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all duration-200",
                  isCurrent ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  {isCurrent ? (
                    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                      خطتك الحالية
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.tagline}</p>
                <p className="mt-4 text-3xl font-bold tracking-tight">
                  {formatIQD(p.price)} <span className="text-xs font-normal text-muted-foreground">/ شهرياً</span>
                </p>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => !isCurrent && handleUpgrade(p.id)}
                  disabled={isCurrent}
                  className={cn(
                    "mt-6 rounded-lg py-2.5 text-xs font-bold transition-all",
                    isCurrent
                      ? "cursor-default border border-border bg-muted/40 text-muted-foreground"
                      : "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
                  )}
                >
                  {isCurrent ? "الباقة المفعلة" : "ترقية الباقة الآن"}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* جدول الفواتير التاريخية */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-border/60">
          <div>
            <h2 className="font-semibold tracking-tight text-sm">سجل الفواتير والاشتراكات</h2>
            <p className="text-xs text-muted-foreground mt-0.5">سجل السحوبات الممالة والمدفوعات لمتجرك</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-right text-muted-foreground">
                <th className="whitespace-nowrap px-5 py-3 font-semibold">رقم الفاتورة</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold">الباقة</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold">التاريخ</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold">المبلغ</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold">الحالة</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-muted-foreground">
                    لا توجد فواتير سابقة حتى الآن.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="whitespace-nowrap px-5 py-3.5 font-bold">{inv.id}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">{inv.plan}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">{inv.date}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 font-semibold">{inv.amount}</td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                        {inv.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-left">
                      <button
                        onClick={() => handleDownloadInvoice(inv.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}