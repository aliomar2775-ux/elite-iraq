"use client"

import React, { useState } from "react"
import { useApp } from "@/lib/app-state"
import { plans } from "@/lib/data"
import {
  ShieldCheck,
  Store,
  Zap,
  Users,
  Search,
  RefreshCw,
  Lock,
  Unlock,
  TrendingUp,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Activity,
  Globe,
  Crown,
  ArrowRight,
  LayoutGrid,
} from "lucide-react"

export function AdminView() {
  const {
    user,
    isAdmin,
    allMerchants,
    adminChangeMerchantPlan,
    adminResetMerchantTokens,
    adminToggleMerchantStatus,
    adminImpersonateMerchant,
    adminBroadcastNotification,
    navigateTo,
  } = useApp()

  const [searchQuery, setSearchQuery] = useState("")
  const [broadcastTitle, setBroadcastTitle] = useState("")
  const [broadcastMessage, setBroadcastMessage] = useState("")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // حماية حاسمة: إخفاء الصفحة تماماً عن غير السوبر أدمن
  if (!isAdmin) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center p-6 rtl">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <AlertTriangle className="h-12 w-12 text-destructive animate-bounce" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">منطقة محمية!</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          عذراً، هذه الصفحة مخصصة للإدارة المركزية لمنصة إيليت العراق فقط ولا تمتلك صلاحية الوصول إليها.
        </p>
      </div>
    )
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // حساب الإحصائيات الشاملة والزيارات من كافة المتاجر
  const totalStores = allMerchants.length
  const totalPaidStores = allMerchants.filter((m) => m.merchant.activePlanId !== "starter").length
  const totalVisitorsAllStores = allMerchants.reduce((sum, m) => sum + (m.merchant.totalVisitors || 0), 0)
  const totalLiveVisitorsAllStores = allMerchants.reduce((sum, m) => sum + (m.merchant.liveVisitors || 0), 0)
  const totalTokensUsed = allMerchants.reduce((sum, m) => sum + (m.merchant.aiTokensUsed || 0), 0)

  // تصفية المتاجر بحسب البحث
  const filteredMerchants = allMerchants.filter(
    (u) =>
      u.merchant.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.merchant.phone.includes(searchQuery)
  )

  const handleSendBroadcast = () => {
    if (!broadcastTitle || !broadcastMessage) return
    adminBroadcastNotification(broadcastTitle, broadcastMessage)
    showToast("تم بث الإشعار بنجاح لكافة تجّار المنصة!")
    setBroadcastTitle("")
    setBroadcastMessage("")
  }

  return (
    <div className="space-y-8 p-6 rtl">
      {/* 👈 شريط الأزرار العلوي (الرئيسية ورجوع) تماماً مثل باقي الصفحات */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigateTo("dashboard")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-accent transition-colors cursor-pointer shadow-xs"
        >
          <LayoutGrid className="h-4 w-4 text-primary" />
          <span>الرئيسية</span>
        </button>

        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-accent transition-colors cursor-pointer shadow-xs"
        >
          <span>رجوع</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* الترويسة العليا */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>مركز التحكم الرئيسي • Super Admin</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">إدارة منصة إيليت العراق</h1>
          <p className="text-muted-foreground text-xs mt-1">
            متابعة الزوار الحية، التحكم بالمتاجر المشتركة، الاشتراكات، واستهلاك الذكاء الاصطناعي.
          </p>
        </div>

        {/* إشعار النجاح اللحظي */}
        {toastMessage && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-2 rounded-xl text-xs font-semibold animate-pulse">
            <CheckCircle2 className="h-4 w-4" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* بطاقات الإحصائيات المركزية الحية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* عداد الزوار الحي */}
        <div className="bg-card border rounded-2xl p-4 space-y-2 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">الزوار النشطين الآن</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-500 flex items-center gap-2">
            <Activity className="h-6 w-6" />
            <span>{totalLiveVisitorsAllStores} زائر</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium">يتصفحون المتاجر حالياً</p>
        </div>

        {/* إجمالي زيارات جميع المتاجر */}
        <div className="bg-card border rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">إجمالي الزيارات</span>
            <Globe className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-extrabold">{totalVisitorsAllStores.toLocaleString("ar-IQ")}</div>
          <p className="text-[10px] text-emerald-500 font-medium">على مستوى كافة المتاجر</p>
        </div>

        {/* إجمالي المتاجر */}
        <div className="bg-card border rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">إجمالي المتاجر</span>
            <Store className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold">{totalStores} متجر</div>
          <p className="text-[10px] text-muted-foreground">مسجل بالمنصة</p>
        </div>

        {/* الاشتراكات المدفوعة */}
        <div className="bg-card border rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">المتاجر المدفوعة</span>
            <Crown className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold">{totalPaidStores} متجر</div>
          <p className="text-[10px] text-amber-500 font-medium">خطط النمو والاحترافية</p>
        </div>

        {/* استهلاك التوكنات */}
        <div className="bg-card border rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">استهلاك الذكاء الاصطناعي</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono">{(totalTokensUsed / 1000).toFixed(0)}k</div>
          <p className="text-[10px] text-muted-foreground">توكن مستهلك كلياً</p>
        </div>
      </div>

      {/* أداة إرسال إشعار جماعي لجميع المتاجر */}
      <div className="bg-card border rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
          <Bell className="h-4 w-4 text-primary" />
          <h2>بث إشعار جماعي لمستخدمي المنصة (Broadcast)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="عنوان الإشعار (مثال: صيانة سيرفرات أو ميزة جديدة)"
            value={broadcastTitle}
            onChange={(e) => setBroadcastTitle(e.target.value)}
            className="bg-background border rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="نص الرسالة التفصيلي..."
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            className="bg-background border rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSendBroadcast}
            className="bg-primary text-primary-foreground font-bold rounded-xl px-4 py-2 text-xs hover:opacity-90 transition cursor-pointer"
          >
            بث الإشعار للجميع 🚀
          </button>
        </div>
      </div>

      {/* جدول إدارة التجّار والمتاجر */}
      <div className="bg-card border rounded-2xl shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold">دليل المتاجر والاشتراكات</h2>
            <p className="text-xs text-muted-foreground">التحكم المباشر وترقية الخطة أو الدخول كتاجر للمعاينة</p>
          </div>

          {/* شريط البحث */}
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="بحث باسم المتجر، المالك، أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background border rounded-xl pr-9 pl-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary w-72"
            />
          </div>
        </div>

        {/* جدول البيانات */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                <th className="p-3">اسم المتجر / المالك</th>
                <th className="p-3">التواصل والبريد</th>
                <th className="p-3">نوع الاشتراك</th>
                <th className="p-3">إحصائيات الزوار</th>
                <th className="p-3">استهلاك الذكاء الاصطناعي</th>
                <th className="p-3">حالة الحساب</th>
                <th className="p-3 text-center">التحكم والعمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredMerchants.map((item) => {
                const isSuspended = item.merchant.status === "suspended"
                const currentPlan = plans.find((p) => p.id === item.merchant.activePlanId) || plans[0]

                return (
                  <tr key={item.id} className="hover:bg-muted/20 transition">
                    <td className="p-3">
                      <div className="font-bold text-foreground text-sm">{item.merchant.storeName || "متجر بدون اسم"}</div>
                      <div className="text-[11px] text-muted-foreground">{item.name}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-[11px]">{item.merchant.phone || "بدون هاتف"}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{item.email}</div>
                    </td>
                    <td className="p-3">
                      <select
                        value={item.merchant.activePlanId}
                        onChange={(e) => {
                          adminChangeMerchantPlan(item.id, e.target.value)
                          showToast(`تم تغيير خطة ${item.merchant.storeName} بنجاح!`)
                        }}
                        className="bg-background border rounded-lg px-2 py-1 text-[11px] font-bold text-primary focus:outline-none"
                      >
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-foreground">{item.merchant.totalVisitors || 0} زائر</div>
                      <div className="text-[10px] text-emerald-500 font-medium">
                        ● {item.merchant.liveVisitors || 0} نشط الآن
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-28 bg-muted h-1.5 rounded-full overflow-hidden mb-1">
                        <div
                          className="bg-primary h-full"
                          style={{
                            width: `${Math.min(
                              100,
                              ((item.merchant.aiTokensUsed || 0) / (item.merchant.aiTokenLimit || 1)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {(item.merchant.aiTokensUsed || 0).toLocaleString("ar-IQ")} / {(item.merchant.aiTokenLimit || 0).toLocaleString("ar-IQ")}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSuspended
                            ? "bg-destructive/10 text-destructive"
                            : "bg-emerald-500/10 text-emerald-500"
                        }`}
                      >
                        {isSuspended ? "مجمّد" : "نشط"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* تصفير التوكنات */}
                        <button
                          title="تصفير حصة التوكنات"
                          onClick={() => {
                            adminResetMerchantTokens(item.id)
                            showToast(`تم تصفير حصة توكنات ${item.merchant.storeName}`)
                          }}
                          className="p-1.5 rounded-lg border hover:bg-accent text-amber-500 cursor-pointer"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>

                        {/* المعاينة كتاجر */}
                        <button
                          title="المعاينة كـ تاجر (Impersonate)"
                          onClick={() => {
                            adminImpersonateMerchant(item.id)
                            showToast(`تم تسجيل الدخول كـ ${item.merchant.storeName}`)
                          }}
                          className="p-1.5 rounded-lg border hover:bg-accent text-blue-500 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* تجميد / تفعيل */}
                        <button
                          title={isSuspended ? "تفعيل الحساب" : "تجميد الحساب"}
                          onClick={() => {
                            adminToggleMerchantStatus(item.id)
                            showToast(`تم تعديل حالة حساب ${item.merchant.storeName}`)
                          }}
                          className={`p-1.5 rounded-lg border hover:bg-accent cursor-pointer ${
                            isSuspended ? "text-emerald-500" : "text-destructive"
                          }`}
                        >
                          {isSuspended ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}