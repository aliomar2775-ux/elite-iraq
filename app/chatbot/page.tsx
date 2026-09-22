import { AppShell } from "@/components/app/app-shell"
import { PageHeader } from "@/components/app/page-header"
import { ChatbotView } from "@/components/app/chatbot-view"

export default function ChatbotPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="الردود التلقائية"
          subtitle="أتمتة الردود على رسائل عملائك داخل العراق"
        />
        <ChatbotView />
      </div>
    </AppShell>
  )
}
