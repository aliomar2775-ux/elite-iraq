import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/data"

const statusMap: Record<string, { style: string; dot: string }> = {
  "مدفوع": {
    style: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  "مؤكد": {
    style: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  "قيد التجهيز": {
    style: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    dot: "bg-amber-500",
  },
  "تم الشحن": {
    style: "bg-sky-500/15 text-sky-500 border-sky-500/30",
    dot: "bg-sky-500",
  },
  "تم التوصيل": {
    style: "bg-emerald-600/15 text-emerald-600 border-emerald-600/30",
    dot: "bg-emerald-600",
  },
  "ملغي": {
    style: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
  "مسترجع": {
    style: "bg-destructive/15 text-destructive border-destructive/30",
    dot: "bg-destructive",
  },
}

const fallbackStatus = {
  style: "bg-muted text-muted-foreground border-border",
  dot: "bg-muted-foreground",
}

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus | string
  className?: string
}) {
  const current = statusMap[status] || fallbackStatus

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border transition-colors shrink-0",
        current.style,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", current.dot)} />
      <span>{status}</span>
    </span>
  )
}