import { AppShell } from "@/components/app/app-shell"
import { PageHeader } from "@/components/app/page-header"
import { ChannelsView } from "@/components/app/channels-view"

export default function ChannelsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="ربط المتاجر"
          subtitle="اربط إنستغرام وتيك توك وواتساب وسناب شات لاستقبال الطلبات في لوحة واحدة"
        />
        <ChannelsView />
      </div>
    </AppShell>
  )
}
