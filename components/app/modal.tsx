"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  title: React.ReactNode
  children: React.ReactNode
  onClose: () => void
  open?: boolean
  isOpen?: boolean
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl"
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
}

export function Modal({
  title,
  children,
  onClose,
  open = true,
  isOpen = true,
  className,
  maxWidth = "2xl",
}: ModalProps) {
  const show = open && isOpen

  // قفل تمرير الصفحة والتقاط مفتاح Escape للإغلاق
  useEffect(() => {
    if (!show) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-4 sm:items-center animate-in fade-in duration-200 rtl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl transition-all animate-in zoom-in-95 duration-200",
          maxWidthClasses[maxWidth] || "max-w-2xl",
          className
        )}
      >
        <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
          <h2 id="modal-title" className="text-base sm:text-lg font-bold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="h-8 w-8 rounded-lg border border-border/60 bg-muted/40 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative">{children}</div>
      </div>
    </div>
  )
}