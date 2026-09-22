import { activity } from "@/lib/data"

export function ActivityFeed() {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-semibold tracking-tight">النشاط الأخير</h2>
      <p className="text-sm text-muted-foreground">تحديثات لحظية من متجرك</p>

      <ol className="mt-5 space-y-4">
        {activity.map((a, i) => (
          <li key={i} className="flex gap-3">
            <div className="mt-1 flex flex-col items-center">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {i < activity.length - 1 ? <span className="mt-1 h-full w-px flex-1 bg-border" /> : null}
            </div>
            <div className="pb-1">
              <p className="text-sm leading-snug">
                <span className="font-semibold">{a.who}</span>{" "}
                <span className="text-muted-foreground">{a.action}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{a.when}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
