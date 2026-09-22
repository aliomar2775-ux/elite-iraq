"use client"

export function Modal({
  title,
  children,
  onClose,
  open = true,
  isOpen = true,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
  open?: boolean
  isOpen?: boolean
}) {
  const show = open && isOpen
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
            إغلاق
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}