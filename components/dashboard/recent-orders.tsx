import { orders, type OrderStatus } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

const statusStyles: Record<OrderStatus, string> = {
  Paid: "bg-emerald-500/10 text-emerald-500",
  Pending: "bg-amber-500/10 text-amber-500",
  Refunded: "bg-destructive/10 text-destructive",
}

export function RecentOrders() {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-5">
        <div>
          <h2 className="font-semibold tracking-tight">Recent Orders</h2>
          <p className="text-sm text-muted-foreground">Latest transactions from your store</p>
        </div>
        <button className="rounded-md border border-input px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent">
          View all
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/40">
                <td className="px-5 py-3 font-medium">{order.id}</td>
                <td className="px-5 py-3">
                  <div className="font-medium">{order.customer}</div>
                  <div className="text-xs text-muted-foreground">{order.email}</div>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      statusStyles[order.status],
                    )}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{order.date}</td>
                <td className="px-5 py-3 text-right font-medium">{order.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
