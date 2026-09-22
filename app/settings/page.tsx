import { AppShell } from "@/components/app/app-shell"
import { PageHeader } from "@/components/app/page-header"
import { SettingsView } from "@/components/app/settings-view"

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="الإعدادات"
          subtitle="عنوان المتجر داخل العراق، العملة IQD، وبيانات الحساب"
        />
        <SettingsView />
      </div>
    </AppShell>
  )
}
