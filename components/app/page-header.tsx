import React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-start sm:items-center justify-between gap-4 rtl", className)}>
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle ? <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2 shrink-0">{action}</div> : null}
    </div>
  )
}