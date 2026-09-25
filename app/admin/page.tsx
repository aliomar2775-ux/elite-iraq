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
  Trash2,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Activity,
  Globe,
  Crown,
  LogOut,
  Send,
  Sliders,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminDashboardPage() {
  const {
    user,
    isAdmin,
    allMerchants,
    adminChangeMerchantPlan,
    adminResetMerchantTokens,
    adminToggleMerchantStatus,
    adminImpersonateMerchant,
    adminBroadcastNotification,
    adminSendMerchantNotification, // 👈 جديد: إشعار موجّه لتاجر واحد فقط، بدل البث للجميع
    logout,
  } = useApp()

  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [broadcastTitle, setBroadcastTitle] = useState("")
  const [broadcastMessage, setBroadcastMessage] = useState("")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // حالة النافذة المنبثقة الداخلية المخصصة ضمن المنصة
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    isPrompt?: boolean
    promptValue?: string
    onPromptConfirm?: (val: string) => void
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center p-6 rtl bg-background text-foreground">
        <div className="rounded-full bg-destructive/10 p-5 mb-4">
          <AlertTriangle className="h-12 w-12 text-destructive animate-bounce" />
        </div>
        <h1 className="text-2xl font-bold mb-2">منطقة إدارية محظورة!</h1>
        <p className="text-muted-foreground max-w-md text-sm mb-6">
          عذراً، هذه الصفحة مخصصة لمدير المنصة الرئيسي (Super Admin) فقط.
        </p>
        <button
          onClick={() => router.replace("/login")}
          className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl text-xs hover:opacity-90 transition cursor-pointer"
        >
          العودة لتسجيل الدخول
        </button>
      </div>
    )
  }

  // إحصائيات المنصة
  const totalStores = allMerchants.length
  const totalPaidStores = allMerchants.filter((m) => m.merchant.activePlanId !== "starter").length
  const totalVisitorsAllStores = allMerchants.reduce((sum, m) => sum + (m.merchant.totalVisitors || 0), 0)
  const totalLiveVisitorsAllStores = allMerchants.reduce((sum, m) => sum + (m.merchant.liveVisitors || 0), 0)
  const totalTokensUsed = allMerchants.reduce((sum, m) => sum + (m.merchant.aiTokensUsed || 0), 0)

  const filteredMerchants = allMerchants.filter(
    (u) =>
      u.merchant.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.merchant.phone.includes(searchQuery)
  )

  const handleSendBroadcast = () => {
    if (!broadcastTitle || !broadcastMessage) {
      showToast("يرجى كتابة عنوان ورسالة الإشعار أولاً")
      return
    }
    adminBroadcastNotification(broadcastTitle, broadcastMessage)
    showToast("تم بث الإشعار بنجاح لكافة تجّار المنصة!")
    setBroadcastTitle("")
    setBroadcastMessage("")
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* رأس لوحة التحكم */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-amber-500 font-bold text-xs mb-0.5">
                <span>مركز التحكم الإداري الشامل • Super Admin</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight">إدارة منصة إيليت العراق (Elite IQ)</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {toastMessage && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-2 rounded-xl text-xs font-semibold animate-pulse shadow-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>{toastMessage}</span>
              </div>
            )}
            <button
              onClick={async () => {
                await logout()
                router.replace("/login")
              }}
              className="flex items-center gap-2 border border-border bg-card hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <LogOut className="h-4 w-4" />
              <span>خروج من الإدارة</span>
            </button>
          </div>
        </div>

        {/* المؤشرات والإحصائيات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-card border rounded-2xl p-5 space-y-2 shadow-xs relative overflow-hidden">
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
            <p className="text-[10px] text-muted-foreground">متواجدون حالياً بالمتاجر</p>
          </div>

          <div className="bg-card border rounded-2xl p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">إجمالي الزيارات</span>
              <Globe className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-extrabold">{totalVisitorsAllStores.toLocaleString("ar-IQ")}</div>
            <p className="text-[10px] text-emerald-500 font-medium">حركة المرور الكلية</p>
          </div>

          <div className="bg-card border rounded-2xl p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">إجمالي المتاجر</span>
              <Store className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold">{totalStores} متجر</div>
            <p className="text-[10px] text-muted-foreground">مسجل بالمنصة</p>
          </div>

          <div className="bg-card border rounded-2xl p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">المتاجر المدفوعة</span>
              <Crown className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold">{totalPaidStores} متجر</div>
            <p className="text-[10px] text-amber-500 font-medium">خطط النمو والاحترافية</p>
          </div>

          <div className="bg-card border rounded-2xl p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">استهلاك الذكاء الاصطناعي</span>
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold font-mono">{(totalTokensUsed / 1000).toFixed(0)}k</div>
            <p className="text-[10px] text-muted-foreground">توكن مستهلك كلياً</p>
          </div>
        </div>

        {/* قسم البث الإذاعي الجماعي */}
        <div className="bg-card border rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-foreground font-bold text-sm">
            <Bell className="h-4 w-4 text-primary" />
            <h2>بث إشعار جماعي فوري لجميع تجّار المنصة (Broadcast)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="عنوان الإشعار (مثال: تحديث أمني أو صيانة سيرفرات)"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              className="bg-background border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="نص الرسالة التفصيلي..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="bg-background border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSendBroadcast}
              className="bg-primary text-primary-foreground font-bold rounded-xl px-4 py-2.5 text-xs hover:opacity-90 transition cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <Send className="h-3.5 w-3.5" />
              <span>إرسال الإشعار للجميع 🚀</span>
            </button>
          </div>
        </div>

        {/* جدول إدارة كافة المتاجر بالمنصة */}
        <div className="bg-card border rounded-2xl shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black">سجل المتاجر والتحكم المركزي</h2>
              <p className="text-xs text-muted-foreground">التحكم الكامل بخطط المتاجر، تجميدها، الدخول المباشر إليها بصفتك أدمن، أو حظرها</p>
            </div>

            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث باسم المتجر، المالك، أو الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background border rounded-xl pr-9 pl-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary w-80"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  <th className="p-3.5">اسم المتجر / المالك</th>
                  <th className="p-3.5">التواصل والبريد</th>
                  <th className="p-3.5">نوع الاشتراك</th>
                  <th className="p-3.5">إحصائيات الزوار</th>
                  <th className="p-3.5">استهلاك الذكاء الاصطناعي</th>
                  <th className="p-3.5">حالة الحساب</th>
                  <th className="p-3.5 text-center">أدوات التحكم والإدارة</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredMerchants.map((item) => {
                  const isSuspended = item.merchant.status === "suspended"

                  return (
                    <tr key={item.id} className="hover:bg-muted/20 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-foreground text-sm">{item.merchant.storeName || "متجر بدون اسم"}</div>
                        <div className="text-[11px] text-muted-foreground">{item.name}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-mono text-[11px]">{item.merchant.phone || "بدون هاتف"}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{item.email}</div>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={item.merchant.activePlanId}
                          onChange={(e) => {
                            adminChangeMerchantPlan(item.id, e.target.value)
                            showToast(`تم تغيير خطة ${item.merchant.storeName} بنجاح!`)
                          }}
                          className="bg-background border rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-primary focus:outline-none cursor-pointer"
                        >
                          {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-foreground">{item.merchant.totalVisitors || 0} زائر</div>
                        <div className="text-[10px] text-emerald-500 font-medium">
                          ● {item.merchant.liveVisitors || 0} نشط الآن
                        </div>
                      </td>
                      <td className="p-3.5">
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
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isSuspended
                              ? "bg-destructive/10 text-destructive"
                              : "bg-emerald-500/10 text-emerald-500"
                          }`}
                        >
                          {isSuspended ? "مجمّد" : "نشط"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* تصفير التوكنات */}
                          <button
                            title="تصفير حصة توكنات الذكاء الاصطناعي"
                            onClick={() => {
                              adminResetMerchantTokens(item.id)
                              showToast(`تم تصفير حصة توكنات ${item.merchant.storeName}`)
                            }}
                            className="p-2 rounded-xl border hover:bg-accent text-amber-500 cursor-pointer transition shadow-2xs"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>

                          {/* المعاينة والدخول المباشر للمتجر */}
                          <button
                            title="الدخول الفوري إلى المتجر بصفتك أدمن"
                            onClick={() => {
                              adminImpersonateMerchant(item.id)
                              router.replace("/") // الانتقال لصفحة المتجر الرئيسي كتاجر مع شريط العودة العائم
                            }}
                            className="p-2 rounded-xl border hover:bg-accent text-blue-500 cursor-pointer transition shadow-2xs"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* تجميد أو تفعيل الحساب */}
                          <button
                            title={isSuspended ? "تفعيل الحساب" : "تجميد الحساب"}
                            onClick={() => {
                              adminToggleMerchantStatus(item.id)
                              showToast(`تم تعديل حالة حساب ${item.merchant.storeName}`)
                            }}
                            className={`p-2 rounded-xl border hover:bg-accent cursor-pointer transition shadow-2xs ${
                              isSuspended ? "text-emerald-500" : "text-amber-600"
                            }`}
                          >
                            {isSuspended ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          </button>

                          {/* إرسال رسالة خاصة وموجهة لهذا المتجر فقط */}
                          <button
                            title="إرسال إشعار خاص لمدير هذا المتجر"
                            onClick={() => {
                              setModalConfig({
                                isOpen: true,
                                title: `إرسال تنبيه خاص لـ: ${item.merchant.storeName}`,
                                message: "اكتب رسالتك الخاصة لتصل مباشرة لصندوق إشعارات هذا التاجر:",
                                isPrompt: true,
                                promptValue: "",
                                onConfirm: () => {},
                                onPromptConfirm: (val) => {
                                  if (val) {
                                    // 👈 إصلاح: إرسال موجّه لهذا التاجر فقط، وليس بثاً لكل تجّار المنصة
                                    adminSendMerchantNotification(
                                      item.id,
                                      `تنبيه إداري لـ ${item.merchant.storeName}`,
                                      val
                                    )
                                    showToast(`تم إرسال التنبيه الخاص إلى ${item.merchant.storeName}`)
                                    setModalConfig((prev) => ({ ...prev, isOpen: false }))
                                  }
                                }
                              })
                            }}
                            className="p-2 rounded-xl border hover:bg-accent text-purple-500 cursor-pointer transition shadow-2xs"
                          >
                            <Sparkles className="h-4 w-4" />
                          </button>

                          {/* نافذة منبثقة داخلية لحظر المتجر برسالة لطيفة */}
                          <button
                            title="حظر وحذف المتجر من المنصة"
                            onClick={() => {
                              setModalConfig({
                                isOpen: true,
                                title: `حظر متجر "${item.merchant.storeName}"`,
                                message: "سيتم تجميد المتجر وإرسال رسالة إشعار لطيفة لصاحبه تفيد بحظر دخوله للمنصة. هل أنت متأكد؟",
                                isPrompt: false,
                                onConfirm: () => {
                                  adminToggleMerchantStatus(item.id)
                                  // 👈 إصلاح: إرسال موجّه لهذا التاجر فقط، وليس بثاً لكل تجّار المنصة
                                  adminSendMerchantNotification(
                                    item.id,
                                    "إشعار بخصوص حسابك",
                                    `عذراً عزيزي تاجر متجر (${item.merchant.storeName})، تم حظر دخولك إلى المنصة وشكراً لاستخدامك إيليت العراق.`
                                  )
                                  showToast(`تم حظر المتجر ${item.merchant.storeName} بنجاح`)
                                  setModalConfig((prev) => ({ ...prev, isOpen: false }))
                                }
                              })
                            }}
                            className="p-2 rounded-xl border border-destructive/30 hover:bg-destructive/10 text-destructive cursor-pointer transition shadow-2xs"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* النافذة المنبثقة التفاعلية المدمجة داخل المنصة */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 rtl text-right animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                {modalConfig.title}
              </h3>
              <button 
                onClick={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-loose">
              {modalConfig.message}
            </p>

            {modalConfig.isPrompt && (
              <input
                type="text"
                autoFocus
                placeholder="اكتب رسالتك هنا..."
                defaultValue={modalConfig.promptValue}
                id="admin-prompt-input"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (modalConfig.isPrompt) {
                    const inputElem = document.getElementById("admin-prompt-input") as HTMLInputElement
                    if (inputElem && modalConfig.onPromptConfirm) {
                      modalConfig.onPromptConfirm(inputElem.value)
                    }
                  } else {
                    modalConfig.onConfirm()
                  }
                }}
                className="flex-1 bg-destructive text-destructive-foreground hover:opacity-90 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm"
              >
                تأكيد وتنفيذ
              </button>
              <button
                onClick={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 border border-border bg-card hover:bg-accent font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}