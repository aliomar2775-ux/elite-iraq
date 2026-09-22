import { AppShell } from "@/components/app/app-shell"
import { PageHeader } from "@/components/app/page-header"
import { ProductsView } from "@/components/app/products-view"

export default function ProductsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="المنتجات والمخزون"
          subtitle="أسعار المنتجات بالدينار العراقي عبر كل القنوات المربوطة"
        />
        <ProductsView canCreate />
      </div>
    </AppShell>
  )
}
