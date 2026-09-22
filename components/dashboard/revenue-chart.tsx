import { revenueSeries } from "@/lib/dashboard-data"

const W = 640
const H = 240
const PAD = 24

function buildPath(values: number[], max: number) {
  const step = (W - PAD * 2) / (values.length - 1)
  const points = values.map((v, i) => {
    const x = PAD + i * step
    const y = H - PAD - (v / max) * (H - PAD * 2)
    return [x, y] as const
  })
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ")
  const area = `${line} L ${points[points.length - 1][0]} ${H - PAD} L ${points[0][0]} ${H - PAD} Z`
  return { line, area, points }
}

export function RevenueChart() {
  const revenue = revenueSeries.map((d) => d.revenue)
  const expenses = revenueSeries.map((d) => d.expenses)
  const max = Math.max(...revenue, ...expenses) * 1.15

  const rev = buildPath(revenue, max)
  const exp = buildPath(expenses, max)

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold tracking-tight">Revenue vs. Expenses</h2>
          <p className="text-sm text-muted-foreground">Last 12 months (in $K)</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--chart-1)]" />
            Revenue
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
            Expenses
          </span>
        </div>
      </div>

      <div className="mt-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-56 w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label="Line chart comparing revenue and expenses over the last 12 months"
        >
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={PAD}
              x2={W - PAD}
              y1={H - PAD - f * (H - PAD * 2)}
              y2={H - PAD - f * (H - PAD * 2)}
              stroke="var(--border)"
              strokeWidth="1"
            />
          ))}

          <path d={rev.area} fill="url(#revFill)" />
          <path d={rev.line} fill="none" stroke="var(--chart-1)" strokeWidth="2.5" strokeLinejoin="round" />
          <path
            d={exp.line}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth="2"
            strokeDasharray="5 5"
            strokeLinejoin="round"
          />

          {rev.points.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="var(--chart-1)" />
          ))}
        </svg>

        <div className="mt-2 flex justify-between px-2 text-xs text-muted-foreground">
          {revenueSeries.map((d) => (
            <span key={d.month}>{d.month}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
