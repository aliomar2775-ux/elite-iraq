import { activity } from "@/lib/dashboard-data"

export function ActivityFeed() {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-semibold tracking-tight">Recent Activity</h2>
      <p className="text-sm text-muted-foreground">What is happening across your team</p>

      <ol className="mt-5 space-y-5">
        {activity.map((item, i) => (
          <li key={i} className="relative flex gap-3 pl-4">
            <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary" />
            {i < activity.length - 1 && (
              <span className="absolute left-[3px] top-4 h-full w-px bg-border" aria-hidden />
            )}
            <div className="text-sm">
              <p>
                <span className="font-medium">{item.who}</span>{" "}
                <span className="text-muted-foreground">{item.action}</span>
              </p>
              <p className="text-xs text-muted-foreground">{item.when}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
