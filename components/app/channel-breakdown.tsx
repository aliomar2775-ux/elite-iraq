import { channelBreakdown } from "@/lib/data"

const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]

export function ChannelBreakdown() {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-semibold tracking-tight">المبيعات حسب القناة</h2>
      <p className="text-sm text-muted-foreground">توزيع الإيرادات هذا الشهر</p>

      <div className="mt-5 space-y-4">
        {channelBreakdown.map((c, i) => (
          <div key={c.channel}>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[i] }} />
                {c.channel}
              </span>
              <span className="text-muted-foreground">{c.sales}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: `${c.share}%`, background: colors[i] }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
