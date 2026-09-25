"use client"

import { useMemo } from "react"
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
import { formatPrice } from "@/lib/utils"

export default function OverviewPage() {
  const {
    orders = [],
    products = [],
    rules = [],
    currency = "IQD",
  } = useApp()

  // 1️⃣ حماية الحسابات الديناميكية ومنع انهيار التطبيق أثناء التحميل
  const dynamicStats = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : []
    const safeProducts = Array.isArray(products) ? products : []
    const safeRules = Array.isArray(rules) ? rules : []

    const totalSalesAmount = safeOrders.reduce(
      (sum, order) => sum + (Number(order?.amount) || 0),
      0
    )
    const totalOrdersCount = safeOrders.length
    const autoReplies = safeRules.reduce(
      (sum, r) => sum + (Number(r?.hits) || 0),
      0
    )
    const conversion = safeProducts.reduce(
      (s, p) => s + (Number(p?.sold) || 0),
      0
    )

    const formattedSales =
      currency === "IQD"
        ? formatIQD(totalSalesAmount)
        : formatPrice(totalSalesAmount, currency)

    return [
      {
        label: "إجمالي المبيعات",
        value: formattedSales,
        delta: 12.5,
        hint: "من الطلبات المسجّلة في المتجر",
      },
      {
        label: "الطلبات الجديدة",
        value: totalOrdersCount.toLocaleString("ar-IQ"),
        delta: 8.2,
        hint: `إجمالي ${totalOrdersCount} طلب مسجل`,
      },
      {
        label: "ردود تلقائية مُرسلة",
        value: autoReplies.toLocaleString("ar-IQ"),
        delta: 24.1,
        hint: "عبر قواعد الشات بوت الآلية",
      },
      {
        label: "قطع مباعة",
        value: conversion.toLocaleString("ar-IQ"),
        delta: 5.4,
        hint: "من كتالوج المنتجات الحالية",
      },
    ]
  }, [orders, products, rules, currency])

  // 2️⃣ نص ديناميكي يتأثر بالتغيير الفوري للعملة
  const subtitleText =
    currency === "IQD"
      ? "أهلاً بعودتك، إليك ملخّص أداء متجرك بالدينار العراقي"
      : "أهلاً بعودتك، إليك ملخّص أداء متجرك بالدولار الأمريكي"

  return (
    <AppShell>
      <div className="space-y-6 rtl text-right">
        {/* رأس الصفحة */}
        <PageHeader title="نظرة عامة" subtitle={subtitleText} />

        {/* 1. بطاقات الإحصائيات السريعة */}
        <StatCards stats={dynamicStats} />

        {/* 2. تحليلات الذكاء الاصطناعي اليومية */}
        <DailyInsights />

        {/* 3. الرسم البياني وتوزيع قنوات البيع */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <SalesChart />
          </div>
          <ChannelBreakdown />
        </div>

        {/* 4. أحدث الطلبات والمنتجات الأكثر مبيعاً والنشاطات */}
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