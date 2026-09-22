import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/data"

const map: Record<OrderStatus, string> = {
  "مدفوع": "bg-chart-5/15 text-chart-5",
  "قيد التجهيز": "bg-warning/15 text-warning",
  "تم الشحن": "bg-primary/15 text-primary",
  "تم التوصيل": "bg-success/15 text-success",
  "ملغي": "bg-muted text-muted-foreground",
  "مسترجع": "bg-destructive/15 text-destructive",
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", map[status])}>
      {status}
    </span>
  )
}
