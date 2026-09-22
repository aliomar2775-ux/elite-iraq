"use client"

import { useState } from "react"
import { salesSeries } from "@/lib/data"
import { formatIQD } from "@/lib/iraq"
import { TrendingUp, Bot, DollarSign } from "lucide-react"

const W = 640
const H = 240
const PAD = 28

function buildPath(values: number[], max: number) {
  const safeMax = max === 0 ? 1 : max
  const step = (W - PAD * 2) / (values.length - 1)
  const points = values.map((v, i) => {
    const x = PAD + i * step
    const y = H - PAD - (v / safeMax) * (H - PAD * 2)
    return [x, isNaN(y) ? H - PAD : y] as const
  })
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ")
  const area = `${line} L ${points[points.length - 1][0]} ${H - PAD} L ${points[0][0]} ${H - PAD} Z`
  return { line, area, points }
}

export function SalesChart() {
  const [metric, setMetric] = useState<"sales" | "ai_chats">("sales")
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // إعداد بيانات معالجة المحادثات بالذكاء الاصطناعي كمؤشر مقارن للمبيعات
  const processedData = salesSeries.map((d, index) => {
    if (metric === "ai_chats") {
      // محاكاة نمو محادثات البوت بناءً على أداء المبيعات
      const aiCurrent = d.current > 0 ? Math.round(d.current / 1500) : (index + 1) * 28
      const aiPrev = d.previous > 0 ? Math.round(d.previous / 1800) : (index + 1) * 12
      return { ...d, activeCurrent: aiCurrent, activePrevious: aiPrev }
    }
    return { ...d, activeCurrent: d.current, activePrevious: d.previous }
  })

  const currentValues = processedData.map((d) => d.activeCurrent)
  const previousValues = processedData.map((d) => d.activePrevious)
  const rawMax = Math.max(...currentValues, ...previousValues)
  const max = rawMax === 0 ? 100 : rawMax * 1.18

  const cur = buildPath(currentValues, max)
  const prev = buildPath(previousValues, max)

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold tracking-tight text-base">
              {metric === "sales" ? "تحليلات المبيعات الشهرية" : "محادثات البوت والذكاء الاصطناعي"}
            </h2>
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3" />
              مؤشر نشط
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {metric === "sales" ? "مقارنة إجمالي الإيرادات بين العام الحالي والسابق" : "عدد الاستفسارات التي تم الرد عليها تلقائياً عبر Gemini"}
          </p>
        </div>

        {/* زر التبديل بين المبيعات ومحادثات البوت */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
          <button
            onClick={() => setMetric("sales")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              metric === "sales"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
            المبيعات
          </button>
          <button
            onClick={() => setMetric("ai_chats")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              metric === "ai_chats"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            تفاعل البوت
          </button>
        </div>
      </div>

      <div className="mt-4 relative" dir="ltr" onMouseLeave={() => setHoveredIndex(null)}>
        {/* التلميح التفاعلي (Tooltip) عند التحويم */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none rounded-lg border border-border bg-popover/95 p-2.5 text-xs shadow-md backdrop-blur rtl:text-right"
            style={{
              left: `${(hoveredIndex / (salesSeries.length - 1)) * 80 + 10}%`,
              top: "10px",
            }}
          >
            <p className="font-bold text-foreground border-b border-border pb-1 mb-1">
              شهر {processedData[hoveredIndex].month}
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-primary font-medium">
                <span>هذا العام:</span>
                <span>
                  {metric === "sales"
                    ? formatIQD(processedData[hoveredIndex].activeCurrent)
                    : `${processedData[hoveredIndex].activeCurrent.toLocaleString()} رد`}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-muted-foreground">
                <span>العام الماضي:</span>
                <span>
                  {metric === "sales"
                    ? formatIQD(processedData[hoveredIndex].activePrevious)
                    : `${processedData[hoveredIndex].activePrevious.toLocaleString()} رد`}
                </span>
              </div>
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-60 w-full overflow-visible"
          preserveAspectRatio="none"
          role="img"
          aria-label="رسم بياني تحليلي"
        >
          <defs>
            <linearGradient id="curFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
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

          {/* مسار الرسم البياني والمساحة المظللة */}
          <path d={cur.area} fill="url(#curFill)" />
          <path d={cur.line} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" />
          <path
            d={prev.line}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeLinejoin="round"
            opacity="0.6"
          />

          {/* خط عمودي للمؤشر عند التأشير */}
          {hoveredIndex !== null && (
            <line
              x1={cur.points[hoveredIndex][0]}
              x2={cur.points[hoveredIndex][0]}
              y1={PAD}
              y2={H - PAD}
              stroke="var(--primary)"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          )}

          {/* النقاط والمسارات التفاعلية */}
          {cur.points.map(([x, y], i) => (
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
              {/* مساحة شفافة عريضة لتسهيل التقاط حركات الماوس */}
              <rect
                x={x - (W - PAD * 2) / (salesSeries.length * 2)}
                y={PAD}
                width={(W - PAD * 2) / salesSeries.length}
                height={H - PAD * 2}
                fill="transparent"
              />
            </g>
          ))}
        </svg>

        {/* أسماء الأشهر في الأسفل */}
        <div className="mt-2 flex justify-between px-2 text-[11px] text-muted-foreground font-medium">
          {salesSeries.map((d, index) => (
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