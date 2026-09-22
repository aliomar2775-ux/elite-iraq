"use client"

import { AppShell } from "@/components/app/app-shell"
import { PageHeader } from "@/components/app/page-header"
import { StatCards } from "@/components/app/stat-cards"
import { SalesChart } from "@/components/app/sales-chart"
import { ChannelBreakdown } from "@/components/app/channel-breakdown"
import { RecentOrders } from "@/components/app/recent-orders"
import { TopProducts } from "@/components/app/top-products"
import { ActivityFeed } from "@/components/app/activity-feed"

// استيراد شاشات التطبيق للتنقل الديناميكي
import { ProductsView } from "@/components/app/products-view"
import { OrdersView } from "@/components/app/orders-view"
import { ChatbotView } from "@/components/app/chatbot-view"
import { ChannelsView } from "@/components/app/channels-view"
import { BillingView } from "@/components/app/billing-view"
import { SettingsView } from "@/components/app/settings-view"

// 🚀 استيراد صفحة التسجيل لعرضها تلقائياً عند عدم وجود جلسة
import LoginPage from "./login/page"

import { useApp } from "@/lib/app-state"
import { formatIQD } from "@/lib/iraq"

export default function OverviewPage() {
  // 🚀 استخراج user و ready لحماية الصفحة والتوجيه الآلي
  const { user, ready, orders, activeTab, setActiveTab } = useApp()

  // 1. انتظار اكتمال قراءة الجلسة من Supabase
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090d] text-white" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    )
  }

  // 2. إذا لم يثبت تسجيل الدخول بـ Google أو غيره -> إظهار واجهة تسجيل الدخول
  if (!user) {
    return <LoginPage />
  }

  // حساب إجمالي المبيعات من الطلبات الحقيقية
  const totalSalesAmount = orders.reduce((sum, order) => sum + (order.amount || 0), 0)
  const totalOrdersCount = orders.length

  const dynamicStats = [
    { label: "إجمالي المبيعات", value: formatIQD(totalSalesAmount), delta: 0, hint: "مقارنة بالشهر الماضي" },
    { label: "الطلبات الجديدة", value: totalOrdersCount.toLocaleString("ar-IQ"), delta: 0, hint: "مقارنة بالشهر الماضي" },
    { label: "ردود تلقائية مُرسلة", value: "٠", delta: 0, hint: "مقارنة بالشهر الماضي" },
    { label: "معدل التحويل", value: "٪٠", delta: 0, hint: "مقارنة بالشهر الماضي" },
  ]

  // 3. عند وجود جلسة توثيق صحيحة -> عرض النظام ولوحة التحكم بالكامل
  return (
    <AppShell activeTab={activeTab} onSelectTab={setActiveTab}>
      {/* 1. الشاشة الرئيسية: النظرة العامة (Dashboard) */}
      {(!activeTab || activeTab === "dashboard" || activeTab === "overview" || activeTab === "/") && (
        <div className="space-y-6">
          <PageHeader
            title="نظرة عامة"
            subtitle="أهلاً بعودتك، إليك ملخّص أداء متجرك بالدينار العراقي"
          />

          <StatCards stats={dynamicStats} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <SalesChart />
            </div>
            <ChannelBreakdown />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <RecentOrders />
            </div>
            <div className="space-y-6">
              <TopProducts />
              <ActivityFeed />
            </div>
          </div>
        </div>
      )}

      {/* 2. الشاشات المربوطة بالذاكرة المركزية */}
      {activeTab === "products" && <ProductsView canCreate />}
      {activeTab === "orders" && <OrdersView onCreate />}
      {activeTab === "chatbot" && <ChatbotView />}
      {activeTab === "channels" && <ChannelsView />}
      {activeTab === "billing" && <BillingView />}
      {activeTab === "settings" && <SettingsView />}
    </AppShell>
  )
}