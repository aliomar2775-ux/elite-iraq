"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Package, PackageCheck, PackageX, Layers, MoreVertical, Edit, Trash2, X } from "lucide-react"
import { useApp } from "@/lib/app-state"
import { type Product } from "@/lib/data"
import { formatIQD } from "@/lib/iraq"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/app/modal"
import { ProductForm } from "@/components/app/product-form"

const filters = ["الكل", "منشور", "مسودة", "نافد"] as const

export function ProductsView({ canCreate = false }: { canCreate?: boolean }) {
  const { products, globalSearchQuery, setGlobalSearchQuery } = useApp()
  const [filter, setFilter] = useState<(typeof filters)[number]>("الكل")
  const [query, setQuery] = useState(globalSearchQuery || "")
  const [openAdd, setOpenAdd] = useState(false)

  // 🎯 1. المزامنة المباشرة مع نص البحث المركزي القادم من Topbar
  useEffect(() => {
    if (globalSearchQuery !== undefined) {
      setQuery(globalSearchQuery)
      if (globalSearchQuery.trim()) {
        setFilter("الكل") // ضمان اختيار تبويب الكل لإظهار المنتج المختار
      }
    }
  }, [globalSearchQuery])

  // 🎯 2. الاستماع التلقائي كخيار احتياطي لحدث التصفية المباشرة
  useEffect(() => {
    const handleFilterProduct = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        setQuery(customEvent.detail)
        setFilter("الكل")
      }
    }

    window.addEventListener("filter-products", handleFilterProduct as EventListener)
    return () => window.removeEventListener("filter-products", handleFilterProduct as EventListener)
  }, [])

  const handleClearQuery = () => {
    setQuery("")
    if (setGlobalSearchQuery) {
      setGlobalSearchQuery("")
    }
  }

  const summary = [
    { label: "إجمالي المنتجات", value: products.length, icon: Layers, tint: "text-chart-1 bg-chart-1/15" },
    { label: "منتجات منشورة", value: products.filter((p) => p.status === "منشور").length, icon: PackageCheck, tint: "text-success bg-success/15" },
    { label: "مخزون منخفض", value: products.filter((p) => p.stock > 0 && p.stock <= 12).length, icon: Package, tint: "text-warning bg-warning/15" },
    { label: "نفد من المخزون", value: products.filter((p) => p.status === "نافد" || p.stock === 0).length, icon: PackageX, tint: "text-destructive bg-destructive/15" },
  ]

  // تصفية القائمة بناءً على التبويب وحقل البحث المباشر
  const list = products.filter((p: any) => {
    const byFilter = filter === "الكل" || p.status === filter
    const cleanQ = query.trim().toLowerCase()
    const nameStr = (p.name || "").toLowerCase()
    const catStr = (p.category || "").toLowerCase()
    const byQuery = !cleanQ || nameStr.includes(cleanQ) || catStr.includes(cleanQ)
    return byFilter && byQuery
  })

  return (
    <div className="space-y-6 rtl">
      {canCreate ? (
        <div className="flex justify-end">
          <button onClick={() => setOpenAdd(true)} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            منتج جديد
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-lg", s.tint)}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{s.value.toLocaleString("ar-IQ")}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (setGlobalSearchQuery) setGlobalSearchQuery(e.target.value)
            }}
            placeholder="ابحث عن منتج..."
            className="h-10 w-full rounded-lg border border-border bg-muted/40 pr-10 pl-8 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:bg-background"
          />
          {query && (
            <button
              onClick={handleClearQuery}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              title="إلغاء التصفية"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {query && (
        <div className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-xs text-primary">
          <span>نتائج التصفية للمنتج: <strong>"{query}"</strong></span>
          <button onClick={handleClearQuery} className="underline font-bold hover:text-primary/80">
            عرض كافة المنتجات
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {list.map((p: any) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {list.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground space-y-2">
            <p>لا توجد منتجات مطابقة لـ "{query}"</p>
            <button
              onClick={() => { handleClearQuery(); setFilter("الكل"); }}
              className="text-xs font-bold text-primary underline"
            >
              إلغاء البحث والتصفية
            </button>
          </div>
        ) : null}
      </div>

      {openAdd ? (
        <Modal title="إضافة منتج بالدينار العراقي" onClose={() => setOpenAdd(false)}>
          <ProductForm onDone={() => setOpenAdd(false)} />
        </Modal>
      ) : null}
    </div>
  )
}

function ProductCard({ product: p }: { product: Product }) {
  const { deleteProduct } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const low = p.stock > 0 && p.stock <= 12
  const out = p.stock === 0
  const stockPct = Math.min(100, (p.stock / 80) * 100)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        <div className="absolute top-2 left-2 z-10" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm shadow-sm hover:bg-background transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen ? (
            <div className="absolute top-9 left-0 w-36 rounded-lg border border-border bg-card p-1 shadow-lg">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  setEditing(true)
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                تعديل المنتج
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  if (confirm(`هل أنت متأكد من حذف المنتج "${p.name}"؟`)) {
                    deleteProduct(p.id)
                  }
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                حذف المنتج
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex h-32 items-center justify-center overflow-hidden bg-muted/40">
          {p.image ? (
            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: `color-mix(in oklch, ${p.accent || "var(--primary)"} 22%, var(--card))` }}
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white"
                style={{ background: p.accent || "var(--primary)" }}
              >
                {p.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.category}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                p.status === "منشور" && "bg-success/15 text-success",
                p.status === "مسودة" && "bg-muted text-muted-foreground",
                p.status === "نافد" && "bg-destructive/15 text-destructive",
              )}
            >
              {p.status}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold">{formatIQD(p.price)}</span>
            <span className="text-xs text-muted-foreground">{p.sold || 0} مبيعًا</span>
          </div>

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">المخزون</span>
              <span className={cn("font-medium", out ? "text-destructive" : low ? "text-warning" : "text-foreground")}>
                {out ? "نفد" : `${p.stock} قطعة`}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", out ? "bg-destructive" : low ? "bg-warning" : "bg-primary")}
                style={{ width: `${out ? 100 : stockPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {editing ? (
        <Modal title="تعديل المنتج" onClose={() => setEditing(false)}>
          <ProductForm product={p} onDone={() => setEditing(false)} />
        </Modal>
      ) : null}
    </>
  )
}