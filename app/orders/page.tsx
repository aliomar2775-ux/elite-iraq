import { AppShell } from "@/components/app/app-shell"
import { PageHeader } from "@/components/app/page-header"
import { OrdersView } from "@/components/app/orders-view"

export default function OrdersPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="الطلبات والشحن"
          subtitle="عناوين التوصيل حسب المحافظات العراقية والمبالغ بالدينار"
        />
        <OrdersView onCreate />
      </div>
    </AppShell>
  )
}
