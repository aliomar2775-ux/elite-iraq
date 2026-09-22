"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Camera, MessageCircle, Unplug, ShieldCheck, Video, Ghost, CheckCircle2, AlertCircle } from "lucide-react"
import { useApp, type ChannelId } from "@/lib/app-state"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/app/modal"

const copy: Record<ChannelId, { title: string; hint: string; placeholder: string }> = {
  instagram: { title: "إنستغرام", hint: "اربط حساب المتجر لاستقبال الطلبات من الرسائل والتعليقات", placeholder: "@store.iq" },
  tiktok: { title: "تيك توك", hint: "اربط المتجر لاستقبال الطلبات من الفيديوهات والرسائل", placeholder: "@store.iq" },
  whatsapp: { title: "واتساب للأعمال", hint: "اربط رقم عراقي لاستقبال الطلبات والردود التلقائية", placeholder: "07XXXXXXXXX" },
  snapchat: { title: "سناب شات", hint: "اربط الحساب لمتابعة الطلبات من القصص والرسائل", placeholder: "store.iq" },
}

function isValidIraqiPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "")
  const iraqiRegex = /^(0)?(77|78|79|75)\d{8}$/
  return iraqiRegex.test(cleanPhone)
}

function ChannelsContent() {
  const { channels, connectChannel, disconnectChannel } = useApp()
  const searchParams = useSearchParams()
  const [editing, setEditing] = useState<ChannelId | null>(null)
  const [handle, setHandle] = useState("")

  const [step, setStep] = useState<"input" | "otp">("input")
  const [otpCode, setOtpCode] = useState("")
  const [pendingPhone, setPendingPhone] = useState("")

  // 🎯 حالة النافذة المنبثقة التابعة للمشروع بدلاً من تنبيهات المتصفح
  const [notificationModal, setNotificationModal] = useState<{
    open: boolean
    title: string
    message: string
    type: "success" | "warning" | "error"
  }>({
    open: false,
    title: "",
    message: "",
    type: "success",
  })

  const showAlertModal = (title: string, message: string, type: "success" | "warning" | "error" = "success") => {
    setNotificationModal({ open: true, title, message, type })
  }

  useEffect(() => {
    const success = searchParams.get("success")
    const connectedHandle = searchParams.get("handle")

    if (success === "instagram_connected" && connectedHandle) {
      connectChannel("instagram", connectedHandle)

      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, "/channels")
      }
      showAlertModal("تم الربط بنجاح", `تم ربط حساب إنستغرام (${connectedHandle}) بنجاح! `, "success")
    }
  }, [searchParams, connectChannel])

  const handleConnectInstagram = () => {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID || "2161207951410525"
    const origin = typeof window !== "undefined" ? window.location.origin : "https://bolt-project-access-pearl.vercel.app"
    const redirectUri = `${origin}/api/instagram`

    const instagramOAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments&response_type=code`

    window.location.href = instagramOAuthUrl
  }

  const getChannelIcon = (id: ChannelId) => {
    switch (id) {
      case "whatsapp":
        return <MessageCircle className="h-5 w-5" />
      case "tiktok":
        return <Video className="h-5 w-5" />
      case "snapchat":
        return <Ghost className="h-5 w-5" />
      default:
        return <Camera className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6 rtl">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {channels.map((channel) => {
          const meta = copy[channel.id]
          const open = editing === channel.id
          const isWhatsapp = channel.id === "whatsapp"
          const isInstagram = channel.id === "instagram"

          return (
            <section key={channel.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    {getChannelIcon(channel.id)}
                  </span>
                  <div>
                    <h2 className="font-semibold">{meta.title}</h2>
                    <p className="text-sm text-muted-foreground">{meta.hint}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    channel.connected ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                  )}
                >
                  {channel.connected ? "متصل" : "غير متصل"}
                </span>
              </div>

              {channel.connected ? (
                <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-sm">
                  <p className="font-medium">
                    {isWhatsapp ? "الرقم المربوط:" : "الحساب:"} {channel.handle}
                  </p>
                  <p className="text-xs text-muted-foreground">الرد التلقائي: مفعل 🟢 | تاريخ الربط: {channel.connectedAt}</p>
                </div>
              ) : null}

              {/* نموذج إدخال الواتساب (OTP Flow) */}
              {open && isWhatsapp && (
                <div className="mt-4 space-y-3">
                  {step === "input" && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (!isValidIraqiPhone(handle)) {
                          showAlertModal(
                            "رقم هاتف غير صحيح",
                            "يرجى إدخال رقم هاتف عراقي صحيح (يبدأ بـ 077, 078, 079, 075).",
                            "warning"
                          )
                          return
                        }
                        setPendingPhone(handle.trim())
                        setStep("otp")
                        showAlertModal(
                          "رمز التأكيد (OTP)",
                          "تم إرسال رمز التأكيد إلى رقم الواتساب الخاص بك. استخدم الرمز التجريبي: 1234",
                          "success"
                        )
                      }}
                      className="space-y-3"
                    >
                      <input
                        required
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        placeholder={meta.placeholder}
                        className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none focus:border-ring focus:bg-background"
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                          إرسال رمز التأكيد
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(null)
                            setStep("input")
                          }}
                          className="h-10 rounded-lg border border-border px-4 text-sm"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  )}

                  {step === "otp" && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (otpCode !== "1234") {
                          showAlertModal(
                            "رمز خاطئ",
                            "رمز التأكيد غير صحيح! استخدم الرمز التجريبي: 1234",
                            "error"
                          )
                          return
                        }
                        connectChannel(channel.id, pendingPhone)
                        setEditing(null)
                        setStep("input")
                        setHandle("")
                        setOtpCode("")
                        showAlertModal(
                          "تم التفعيل بنجاح",
                          "تم ربط رقم الواتساب وتفعيل الرد التلقائي بنجاح تام! ",
                          "success"
                        )
                      }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-2 rounded-md">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span>أدخل رمز التأكيد المرسل إلى الرقم: {pendingPhone}</span>
                      </div>
                      <input
                        required
                        maxLength={4}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="أدخل رمز الـ OTP (مثال: 1234)"
                        className="h-10 w-full text-center tracking-widest font-bold rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none focus:border-ring focus:bg-background"
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="h-10 flex-1 rounded-lg bg-success text-sm font-semibold text-white">
                          تحقيق وتفعيل الرد التلقائي
                        </button>
                        <button type="button" onClick={() => setStep("input")} className="h-10 rounded-lg border border-border px-4 text-sm">
                          رجوع
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* نموذج إدخال باقي القنوات */}
              {open && !isWhatsapp && (
                <div className="mt-4 space-y-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (!handle.trim()) return
                      connectChannel(channel.id, handle.trim())
                      setEditing(null)
                      setHandle("")
                      showAlertModal(
                        "تم ربط القناة",
                        `تم ربط حساب ${meta.title} (${handle.trim()}) بنجاح! `,
                        "success"
                      )
                    }}
                    className="space-y-3"
                  >
                    <input
                      required
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder={meta.placeholder}
                      className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none focus:border-ring focus:bg-background"
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                        حفظ وربط القناة
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(null)
                          setHandle("")
                        }}
                        className="h-10 rounded-lg border border-border px-4 text-sm"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* أزرار الإجراءات الرئيسية */}
              {!open && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      if (isInstagram) {
                        handleConnectInstagram()
                      } else {
                        setEditing(channel.id)
                        setHandle(channel.handle || "")
                        if (isWhatsapp) setStep("input")
                      }
                    }}
                    className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
                  >
                    {channel.connected ? "تحديث الربط" : "ربط المتجر"}
                  </button>

                  {isInstagram && !channel.connected && (
                    <button
                      onClick={() => {
                        setEditing(channel.id)
                        setHandle(channel.handle || "")
                      }}
                      className="h-10 rounded-lg border border-border px-3 text-xs text-muted-foreground hover:bg-muted"
                      title="ربط يدوي بحساب إنستغرام"
                    >
                      ربط يدوي
                    </button>
                  )}

                  {channel.connected ? (
                    <button
                      onClick={() => disconnectChannel(channel.id)}
                      className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:text-destructive"
                    >
                      <Unplug className="h-4 w-4" />
                      فصل
                    </button>
                  ) : null}
                </div>
              )}
            </section>
          )
        })}
      </div>

      {/*  النافذة المنبثقة التابعة للمشروع بدلاً من alert المتصفح */}
      {notificationModal.open && (
        <Modal title={notificationModal.title} onClose={() => setNotificationModal((prev) => ({ ...prev, open: false }))}>
          <div className="space-y-4 pt-2 text-center">
            <div className="flex justify-center">
              {notificationModal.type === "success" && <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-bounce" />}
              {notificationModal.type === "warning" && <AlertCircle className="h-12 w-12 text-amber-500 animate-pulse" />}
              {notificationModal.type === "error" && <AlertCircle className="h-12 w-12 text-destructive animate-pulse" />}
            </div>
            <p className="text-sm text-foreground font-medium leading-relaxed">
              {notificationModal.message}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setNotificationModal((prev) => ({ ...prev, open: false }))}
                className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                موافق
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export function ChannelsView() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm text-muted-foreground">جارٍ تحميل القنوات...</div>}>
      <ChannelsContent />
    </Suspense>
  )
}