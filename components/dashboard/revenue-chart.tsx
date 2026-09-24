"use client"

import { useState, useCallback } from "react"
import { useApp } from "@/lib/app-state"
import { formatIQD } from "@/lib/iraq"
import { formatPrice } from "@/lib/utils"
import { DollarSign } from "lucide-react"

export interface RevenueSeriesItem {
  month: string
  revenue: number
  expenses: number
}

const defaultSeries: RevenueSeriesItem[] = [
  { month: "كانون 2", revenue: 4500000, expenses: 2100000 },
  { month: "شباط", revenue: 5200000, expenses: 2300000 },
  { month: "آذار", revenue: 6100000, expenses: 2800000 },
  { month: "نيسان", revenue: 5800000, expenses: 2600000 },
  { month: "أيار", revenue: 7300000, expenses: 3100000 },
  { month: "حزيران", revenue: 8400000, expenses: 3500000 },
  { month: "تموز", revenue: 7900000, expenses: 3200000 },
  { month: "آب", revenue: 9200000, expenses: 3900000 },
  { month: "أيلول", revenue: 8800000, expenses: 3700000 },
  { month: "تشرين 1", revenue: 9800000, expenses: 4100000 },
  { month: "تشرين 2", revenue: 10500000, expenses: 4400000 },
  { month: "كانون 1", revenue: 11800000, expenses: 4800000 },
]

const W = 640
const H = 240
const PAD = 28

function buildPath(values: number[], max: number) {
  const safeMax = max === 0 ? 1 : max
  const step = values.length > 1 ? (W - PAD * 2) / (values.length - 1) : 0
  const points = values.map((v, i) => {
    const x = PAD + i * step
    const y = H - PAD - (v / safeMax) * (H - PAD * 2)
    return [x, isNaN(y) ? H - PAD : y] as const
  })
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ")
  const lastX = points.length > 0 ? points[points.length - 1][0] : PAD
  const firstX = points.length > 0 ? points[0][0] : PAD
  const area = `${line} L ${lastX} ${H - PAD} L ${firstX} ${H - PAD} Z`
  return { line, area, points }
}

export function RevenueChart({ data }: { data?: RevenueSeriesItem[] }) {
  const { currency } = useApp()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const series = data && data.length > 0 ? data : defaultSeries

  const renderMoney = useCallback(
    (amount: number) => {
      return currency === "IQD" ? formatIQD(amount) : formatPrice(amount, currency)
    },
    [currency]
  )

  const revenue = series.map((d) => d.revenue)
  const expenses = series.map((d) => d.expenses)
  const rawMax = Math.max(...revenue, ...expenses)
  const max = rawMax === 0 ? 100 : rawMax * 1.15

  const rev = buildPath(revenue, max)
  const exp = buildPath(expenses, max)

  const activeItem = hoveredIndex !== null ? series[hoveredIndex] : null

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs rtl text-foreground text-right">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary shrink-0" />
            <h2 className="font-bold text-sm sm:text-base tracking-tight text-foreground">
              الإيرادات مقابل المصاريف
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            مقارنة الأداء المالي خلال آخر 12 شهرًا ({currency === "IQD" ? "بالدينار العراقي" : "بالدولار"})
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            الإيرادات
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
            المصاريف
          </span>
        </div>
      </div>

      <div className="mt-4 relative" dir="ltr" onMouseLeave={() => setHoveredIndex(null)}>
        {/* التلميح التفاعلي (Tooltip) عند التأشير */}
        {activeItem && hoveredIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none rounded-xl border border-border bg-popover/95 p-3 text-xs shadow-xl backdrop-blur-xs rtl:text-right transition-all duration-150 animate-in fade-in zoom-in-95"
            style={{
              left: `${Math.min(82, Math.max(8, (hoveredIndex / (series.length - 1)) * 80 + 10))}%`,
              top: "10px",
            }}
          >
            <p className="font-bold text-foreground border-b border-border/60 pb-1 mb-1.5">
              شهر {activeItem.month}
            </p>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between gap-4 text-primary font-bold">
                <span className="font-sans">الإيرادات:</span>
                <span>{renderMoney(activeItem.revenue)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-muted-foreground font-medium">
                <span className="font-sans">المصاريف:</span>
                <span>{renderMoney(activeItem.expenses)}</span>
              </div>
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-56 w-full overflow-visible"
          preserveAspectRatio="none"
          role="img"
          aria-label="رسم بياني لمقارنة الإيرادات بالمصاريف"
        >
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* خطوط الشبكة الخلفية */}
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={PAD}
              x2={W - PAD}
              y1={H - PAD - f * (H - PAD * 2)}
              y2={H - PAD - f * (H - PAD * 2)}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          ))}

          {/* المسارات البرمجية */}
          <path d={rev.area} fill="url(#revFill)" />
          <path d={rev.line} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" />
          <path
            d={exp.line}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth="2"
            strokeDasharray="5 5"
            strokeLinejoin="round"
            opacity="0.7"
          />

          {/* خط المؤشر الرأسي */}
          {hoveredIndex !== null && rev.points[hoveredIndex] && (
            <line
              x1={rev.points[hoveredIndex][0]}
              x2={rev.points[hoveredIndex][0]}
              y1={PAD}
              y2={H - PAD}
              stroke="var(--primary)"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          )}

          {/* النقاط والمساحات التفاعلية */}
          {rev.points.map(([x, y], i) => (
            <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(i)}>
              <circle
                cx={x}
                cy={y}
                r={hoveredIndex === i ? "6" : "3.5"}
                fill={hoveredIndex === i ? "var(--background)" : "var(--primary)"}
                stroke="var(--primary)"
                strokeWidth={hoveredIndex === i ? "3" : "0"}
                className="transition-all duration-150"
              />
              <rect
                x={x - (W - PAD * 2) / (series.length * 2)}
                y={PAD}
                width={(W - PAD * 2) / series.length}
                height={H - PAD * 2}
                fill="transparent"
              />
            </g>
          ))}
        </svg>

        {/* أسماء الأشهر */}
        <div className="mt-2 flex justify-between px-2 text-[11px] text-muted-foreground font-medium">
          {series.map((d, index) => (
            <span
              key={d.month}
              className={`cursor-pointer transition-colors ${
                hoveredIndex === index ? "text-primary font-bold" : "hover:text-foreground"
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
            >
              {d.month}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}