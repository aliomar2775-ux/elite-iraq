import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { stats } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const positive = stat.delta >= 0
        return (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <div className="mt-2 flex items-end justify-between gap-2">
              <span className="text-2xl font-semibold tracking-tight">{stat.value}</span>
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  positive
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-destructive/10 text-destructive",
                )}
              >
                {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(stat.delta)}%
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
          </div>
        )
      })}
    </div>
  )
}
