"use client"

import { useState, useEffect } from "react"
import {
  Moon,
  Sun,
  Laptop,
  Bell,
  Store,
  Save,
  Check,
  User,
  Phone,
  Mail,
  MapPin,
  Volume2,
  AlertTriangle,
  Send,
  Clock,
  Database,
  ShieldBan,
  FileSpreadsheet,
  Download,
  Sparkles,
} from "lucide-react"
import { useApp } from "@/lib/app-state"
import { cn } from "@/lib/utils"
import { sendTelegramMessage } from "@/lib/integrations"

interface OrderExportRow {
  id: string
  customerName?: string
  customer?: string
  phone?: string
  governorate?: string
  totalAmount?: number
  amount?: number
  status?: string
}

export function SettingsView() {
  const { merchant, theme, setTheme, updateMerchant, orders = [] } = useApp()
  const merchantEmail = (merchant as { email?: string } | null | undefined)?.email
  const merchantOwnerName = (merchant as { ownerName?: string } | null | undefined)?.ownerName

  const [saved, setSaved] = useState(false)

  // 1️⃣ بيانات المتجر والتاجر الكاملة
  const [storeName, setStoreName] = useState(merchant?.storeName ?? "متجر لمسة")
  const [ownerName, setOwnerName] = useState(merchantOwnerName ?? "نورالدين الدليمي")
  const [phone, setPhone] = useState(merchant?.phone ?? "07701230000")
  const [email, setEmail] = useState(merchantEmail ?? "store@example.com")
  const [address, setAddress] = useState<string>(
    typeof merchant?.address === "string" ? merchant.address : "بغداد - الكرادة"
  )

  // 2️⃣ مركز التنبيهات والإشعارات الفورية
  const [emailNewOrder, setEmailNewOrder] = useState(true)
  const [soundNotification, setSoundNotification] = useState(true)
  const [whatsappMerchantAlert, setWhatsappMerchantAlert] = useState(true)
  const [highRiskAlert, setHighRiskAlert] = useState(true)

  // 3️⃣ الميزات المتقدمة والأتمتة
  const [telegramSettings, setTelegramSettings] = useState({
    enabled: true,
    botToken: "718293849:AAEgX...",
    chatId: "@my_store_orders",
  })

  const [businessHours, setBusinessHours] = useState({
    enabled: true,
    startTime: "10:00",
    endTime: "23:00",
    offHoursMessage:
      "أهلاً بك عيوني! المتجر مغلق حالياً، أوقات عملنا الرسمية من 10:00 صباحاً إلى 11:00 مساءً. تم تسجيل طلبك وسنقوم بالرد عليك فور بدء الدوام 🌸",
  })

  const [autoBackup, setAutoBackup] = useState({
    enabled: true,
    frequency: "weekly",
  })

  const [antiSpam, setAntiSpam] = useState({
    enabled: true,
    blockedNumbers: "07700000000, 07800000000",
    autoBlockHighReturns: true,
  })

  // مزامنة البيانات عند تحديث الـ Context
  useEffect(() => {
    if (merchant) {
      setStoreName(merchant.storeName ?? "متجر لمسة")
      setPhone(merchant.phone ?? "07701230000")
      if (merchantOwnerName) setOwnerName(merchantOwnerName)
      if (merchantEmail) setEmail(merchantEmail)
      if (merchant.address) {
        setAddress(typeof merchant.address === "string" ? merchant.address : "")
      }
    }
  }, [merchant, merchantEmail, merchantOwnerName])

  // 🔔 تشغيل الصوت التنبيهي للمتصفح بدون any
  const playSoundEffect = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return

      const audioCtx = new AudioContextClass()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime)
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.2)
    } catch {
      console.log("Audio play policy restriction")
    }
  }

  // 📊 تصدير ملف البيانات للتحميل المباشر
  const handleExportData = () => {
    const dataRows: OrderExportRow[] =
      orders.length > 0
        ? orders
        : [
            { id: "1084", customerName: "علي حسين", phone: "07701234567", governorate: "بغداد", totalAmount: 45000, status: "مؤكد" },
            { id: "1085", customerName: "سيف السلام", phone: "07809876543", governorate: "ديالى", totalAmount: 32000, status: "قيد التجهيز" },
          ]

    const headers = ["رقم الطلب", "اسم الزبون", "رقم الهاتف", "المحافظة", "المبلغ الكلي", "الحالة"]
    const rows = dataRows.map((o) => [
      o.id,
      `"${o.customerName || o.customer || ""}"`,
      `"${o.phone || ""}"`,
      `"${o.governorate || ""}"`,
      o.totalAmount || o.amount || 0,
      `"${o.status || "مؤكد"}"`,
    ])
    const content = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")

    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `store_orders_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 💾 دالة حفظ الإعدادات وإرسال الإشعار
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    updateMerchant({
      storeName,
      phone,
      ownerName,
      email,
      address: typeof merchant?.address === "object" && merchant?.address !== null
        ? { ...merchant.address, details: address }
        : (address as unknown as any),
      notifications: {
        emailNewOrder,
        soundNotification,
        whatsappMerchantAlert,
        highRiskAlert,
      },
      telegramSettings,
      businessHours,
      autoBackup,
      antiSpam,
    } as any)

    if (soundNotification) {
      playSoundEffect()
    }

    if (telegramSettings.enabled && telegramSettings.botToken && telegramSettings.chatId) {
      await sendTelegramMessage(
        {
          botToken: telegramSettings.botToken,
          chatId: telegramSettings.chatId,
        },
        `<b>🔔 تم تحديث إعدادات المتجر بنجاح!</b>\n\n<b>اسم المتجر:</b> ${storeName}\n<b>المسؤول:</b> ${ownerName}\n<b>رقم الجوال:</b> ${phone}\n<b>تاريخ التحديث:</b> ${new Date().toLocaleString("ar-IQ")}`
      )
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl pb-12 rtl text-foreground">
      {/* 1️⃣ تفضيلات المظهر والواجهة */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-base text-foreground">تفضيلات المظهر والواجهة</h3>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2">
            نمط المظهر (Theme Mode)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={cn(
                "p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                theme === "system"
                  ? "bg-primary/10 border-primary text-primary shadow-xs"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Laptop className="h-4 w-4" />
              تلقائي (حسب جهاز التاجر)
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                theme === "dark"
                  ? "bg-primary/10 border-primary text-primary shadow-xs"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Moon className="h-4 w-4" />
              الوضع الداكن (Dark)
            </button>

            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                theme === "light"
                  ? "bg-primary/10 border-primary text-primary shadow-xs"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Sun className="h-4 w-4" />
              الوضع النهاري (Light)
            </button>
          </div>
        </div>
      </div>

      {/* 2️⃣ بيانات المتجر والتاجر الكاملة */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Store className="h-5 w-5 text-emerald-500" />
          <h3 className="font-bold text-base text-foreground">بيانات المتجر والتاجر المعتمدة</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">اسم المتجر التجاري</label>
            <div className="relative">
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-background pr-9 pl-3 text-xs font-bold outline-none focus:border-primary text-foreground"
              />
              <Store className="h-4 w-4 text-muted-foreground absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">اسم صاحب المتجر / المسؤول</label>
            <div className="relative">
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-background pr-9 pl-3 text-xs font-bold outline-none focus:border-primary text-foreground"
              />
              <User className="h-4 w-4 text-muted-foreground absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">رقم الجوال الرئيسي</label>
            <div className="relative">
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-background pr-9 pl-3 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
              />
              <Phone className="h-4 w-4 text-muted-foreground absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">البريد الإلكتروني للإشعارات</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-10 rounded-lg border border-border bg-background pr-9 pl-3 text-xs font-mono outline-none focus:border-primary text-foreground"
              />
              <Mail className="h-4 w-4 text-muted-foreground absolute right-3 top-3" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1">عنوان / مقر المتجر الرئيسي</label>
            <div className="relative">
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: بغداد - الكرادة - قرب نفق الشرطة"
                className="w-full h-10 rounded-lg border border-border bg-background pr-9 pl-3 text-xs outline-none focus:border-primary text-foreground"
              />
              <MapPin className="h-4 w-4 text-muted-foreground absolute right-3 top-3" />
            </div>
          </div>
        </div>
      </div>

      {/* 3️⃣ مركز التنبيهات والإشعارات الفورية */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Bell className="h-5 w-5 text-amber-500" />
          <h3 className="font-bold text-base text-foreground">التنبيهات والإشعارات</h3>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="font-bold text-foreground">إرسال إشعار بريدي عند استلام طلب جديد</p>
                <p className="text-[10px] text-muted-foreground">تصلك تفاصيل الطلب فوراً إلى البريد ({email})</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailNewOrder}
              onChange={(e) => setEmailNewOrder(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Volume2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-foreground">إشعار صوتي فوري داخل المنصة</p>
                <p className="text-[10px] text-muted-foreground">تشغيل صوت تنبيه عند ورود رسالة أو طلب جديد من الزبائن</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundNotification}
              onChange={(e) => {
                setSoundNotification(e.target.checked)
                if (e.target.checked) playSoundEffect()
              }}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-sky-400 shrink-0" />
              <div>
                <p className="font-bold text-foreground">إرسال تنبيه واتساب للتاجر فور تأكيد الطلب</p>
                <p className="text-[10px] text-muted-foreground">رسالة واتساب تحتوي تفاصيل الطلب على رقمك ({phone})</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={whatsappMerchantAlert}
              onChange={(e) => setWhatsappMerchantAlert(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <p className="font-bold text-foreground">تنبيه الزبائن المشبوهين والراجع العالي</p>
                <p className="text-[10px] text-muted-foreground">إشعارك فوري أثناء المحادثة إذا كان الزبون يمتلك نسبة راجع سابقة</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={highRiskAlert}
              onChange={(e) => setHighRiskAlert(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
            />
          </label>
        </div>
      </div>

      {/* 4️⃣ الميزات المتقدمة والأتمتة الذكية */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          الميزات المتقدمة والأتمتة الذكية
        </h3>

        {/* 🎯 الميزة 1: ربط بوت تليجرام */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Send className="h-5 w-5 text-sky-400 shrink-0" />
              <div>
                <h4 className="font-bold text-xs text-foreground">1. ربط بوت تليجرام للإشعارات الفورية (Telegram Bot)</h4>
                <p className="text-[10px] text-muted-foreground">استلام كافة طلبات الزبائن مباشرة على قناتك أو شات التليجرام الخاص بك.</p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={telegramSettings.enabled}
              onClick={() => setTelegramSettings({ ...telegramSettings, enabled: !telegramSettings.enabled })}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors cursor-pointer",
                telegramSettings.enabled ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 h-4 w-4 rounded-full bg-white transition-all shadow-xs",
                  telegramSettings.enabled ? "right-1" : "right-6"
                )}
              />
            </button>
          </div>

          {telegramSettings.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs border-t border-border/60">
              <div>
                <label className="block font-semibold mb-1 text-foreground">رمز البوت (Bot Token)</label>
                <input
                  type="text"
                  value={telegramSettings.botToken}
                  onChange={(e) => setTelegramSettings({ ...telegramSettings, botToken: e.target.value })}
                  placeholder="718293849:AAEgX..."
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 font-mono text-xs outline-none focus:border-primary text-foreground"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-foreground">معرّف القناة / المجموعة (Chat ID)</label>
                <input
                  type="text"
                  value={telegramSettings.chatId}
                  onChange={(e) => setTelegramSettings({ ...telegramSettings, chatId: e.target.value })}
                  placeholder="@my_store_orders"
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 font-mono text-xs outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>
          )}
        </div>

        {/* 🎯 الميزة 2: ساعات العمل والرد التلقائي */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <h4 className="font-bold text-xs text-foreground">2. ساعات العمل والرد التلقائي (Business Hours)</h4>
                <p className="text-[10px] text-muted-foreground">تحديد أوقات الدوام الرسمية ليقوم البوت بإعلام الزبائن بالرد خارج ساعات العمل.</p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={businessHours.enabled}
              onClick={() => setBusinessHours({ ...businessHours, enabled: !businessHours.enabled })}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors cursor-pointer",
                businessHours.enabled ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 h-4 w-4 rounded-full bg-white transition-all shadow-xs",
                  businessHours.enabled ? "right-1" : "right-6"
                )}
              />
            </button>
          </div>

          {businessHours.enabled && (
            <div className="space-y-3 pt-2 text-xs border-t border-border/60">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">وقت بدء العمل</label>
                  <input
                    type="time"
                    value={businessHours.startTime}
                    onChange={(e) => setBusinessHours({ ...businessHours, startTime: e.target.value })}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 font-mono font-bold text-xs outline-none focus:border-primary text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-foreground">وقت إغلاق العمل</label>
                  <input
                    type="time"
                    value={businessHours.endTime}
                    onChange={(e) => setBusinessHours({ ...businessHours, endTime: e.target.value })}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 font-mono font-bold text-xs outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">رسالة الرد التلقائي خارج أوقات العمل</label>
                <textarea
                  rows={2}
                  value={businessHours.offHoursMessage}
                  onChange={(e) => setBusinessHours({ ...businessHours, offHoursMessage: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs outline-none focus:border-primary leading-relaxed text-foreground"
                />
              </div>
            </div>
          )}
        </div>

        {/* 🎯 الميزة 3: النسخ الاحتياطي وتصدير البيانات */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <h4 className="font-bold text-xs text-foreground">3. النسخ الاحتياطي وتصدير البيانات (Auto Backup & Export)</h4>
                <p className="text-[10px] text-muted-foreground">تفعيل النسخ الاحتياطي الدوري وتصدير شيتات Excel للطلبات للشركات.</p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={autoBackup.enabled}
              onClick={() => setAutoBackup({ ...autoBackup, enabled: !autoBackup.enabled })}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors cursor-pointer",
                autoBackup.enabled ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 h-4 w-4 rounded-full bg-white transition-all shadow-xs",
                  autoBackup.enabled ? "right-1" : "right-6"
                )}
              />
            </button>
          </div>

          {autoBackup.enabled && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-border/60">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">تكرار النسخ الاحتياطي:</span>
                <select
                  value={autoBackup.frequency}
                  onChange={(e) => setAutoBackup({ ...autoBackup, frequency: e.target.value })}
                  className="h-8 px-2 rounded-lg border border-border bg-background font-bold text-xs outline-none focus:border-primary text-foreground cursor-pointer"
                >
                  <option value="weekly">أسبوعي (تلقائي)</option>
                  <option value="monthly">شهري (تلقائي)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="h-8 px-3 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1.5 hover:bg-emerald-500 transition-all shadow-xs cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  تصدير ملف Excel 📊
                </button>

                <button
                  type="button"
                  onClick={handleExportData}
                  className="h-8 px-3 rounded-lg border border-border bg-background text-foreground font-bold text-[11px] flex items-center gap-1.5 hover:bg-muted transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  تصدير CSV
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 🎯 الميزة 4: نظام حظر الحسابات والسبام */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldBan className="h-5 w-5 text-red-500 shrink-0" />
              <div>
                <h4 className="font-bold text-xs text-foreground">4. نظام حظر الحسابات والسبام (Blacklist & Anti-Spam)</h4>
                <p className="text-[10px] text-muted-foreground">منع الأرقام الوهمية والزبائن المزعجين من استهلاك التوكنات أو إزعاج البوت.</p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={antiSpam.enabled}
              onClick={() => setAntiSpam({ ...antiSpam, enabled: !antiSpam.enabled })}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors cursor-pointer",
                antiSpam.enabled ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 h-4 w-4 rounded-full bg-white transition-all shadow-xs",
                  antiSpam.enabled ? "right-1" : "right-6"
                )}
              />
            </button>
          </div>

          {antiSpam.enabled && (
            <div className="space-y-3 pt-2 text-xs border-t border-border/60">
              <div>
                <label className="block font-semibold mb-1 text-foreground">الأرقام أو الحسابات المحظورة (افصل بينها بفاصلة)</label>
                <textarea
                  rows={2}
                  value={antiSpam.blockedNumbers}
                  onChange={(e) => setAntiSpam({ ...antiSpam, blockedNumbers: e.target.value })}
                  placeholder="مثال: 07700000000, 07800000000"
                  className="w-full rounded-lg border border-border bg-background p-2.5 font-mono text-xs outline-none focus:border-primary text-foreground"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={antiSpam.autoBlockHighReturns}
                  onChange={(e) => setAntiSpam({ ...antiSpam, autoBlockHighReturns: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                />
                <span className="font-bold text-foreground">حظر تلقائي لأي زبون تتجاوز نسبة الراجع لديه 3 طلبات متتالية.</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* زر الحفظ وإشارة النجاح */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
        >
          <Save className="h-4 w-4" />
          حفظ التغييرات والتفعيل
        </button>

        {saved && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 animate-in fade-in">
            <Check className="h-4 w-4" />
            تم حفظ جميع الإعدادات وتفعيل النظام بنجاح
          </span>
        )}
      </div>
    </form>
  )
}