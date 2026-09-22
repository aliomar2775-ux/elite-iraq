import { AppShell } from "@/components/app/app-shell"
import { PageHeader } from "@/components/app/page-header"
import { BillingView } from "@/components/app/billing-view"

export default function BillingPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="الفوترة والاشتراك"
          subtitle="أدر خطتك، تابع استهلاكك، واطّلع على فواتيرك"
        />
        <BillingView />
      </div>
    </AppShell>
  )
}
