"use client"

import { AppShell } from "@/components/app/app-shell"
import { PageHeader } from "@/components/app/page-header"
import { StatCards } from "@/components/app/stat-cards"
import { SalesChart } from "@/components/app/sales-chart"
import { ChannelBreakdown } from "@/components/app/channel-breakdown"
import { RecentOrders } from "@/components/app/recent-orders"
import { TopProducts } from "@/components/app/top-products"
import { ActivityFeed } from "@/components/app/activity-feed"
import { DailyInsights } from "@/components/app/daily-insights"
import { useApp } from "@/lib/app-state"
import { formatIQD } from "@/lib/iraq"

export default function OverviewPage() {
  const { orders, products, rules } = useApp()

  const totalSalesAmount = orders.reduce((sum, order) => sum + (order.amount || 0), 0)
  const totalOrdersCount = orders.length
  const autoReplies = rules.reduce((sum, r) => sum + (r.hits || 0), 0)
  const conversion = products.reduce((s, p) => s + (p.sold || 0), 0)

  const dynamicStats = [
    { label: "إجمالي المبيعات", value: formatIQD(totalSalesAmount), delta: 0, hint: "من الطلبات المسجّلة" },
    { label: "الطلبات الجديدة", value: totalOrdersCount.toLocaleString("ar-IQ"), delta: 0, hint: "إجمالي الطلبات" },
    { label: "ردود تلقائية مُرسلة", value: autoReplies.toLocaleString("ar-IQ"), delta: 0, hint: "من القواعد الجاهزة" },
    { label: "قطع مباعة", value: conversion.toLocaleString("ar-IQ"), delta: 0, hint: "من كتالوج المنتجات" },
  ]

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="نظرة عامة"
          subtitle="أهلاً بعودتك، إليك ملخّص أداء متجرك بالدينار العراقي"
        />
        <StatCards stats={dynamicStats} />
        <DailyInsights />
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
    </AppShell>
  )
}
