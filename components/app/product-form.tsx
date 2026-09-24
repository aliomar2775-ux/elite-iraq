"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-state"
import { type Product, type ProductStatus } from "@/lib/data"
import { ImagePlus, X, AlertCircle } from "lucide-react"

export function ProductForm({ product, onDone }: { product?: Product; onDone: () => void }) {
  const { addProduct, updateProduct, currency } = useApp()
  const [name, setName] = useState(product?.name || "")
  const [category, setCategory] = useState(product?.category || "أزياء نسائية")
  const [price, setPrice] = useState<number>(product?.price ?? 50000)
  const [stock, setStock] = useState<number>(product?.stock ?? 10)
  const [reorderPoint, setReorderPoint] = useState<number>(product?.reorderPoint ?? 10)
  const [status, setStatus] = useState<ProductStatus>(product?.status || "منشور")
  const [image, setImage] = useState<string>(product?.image || "")
  const [accent, setAccent] = useState<string>(product?.accent || "var(--chart-1)")
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("يرجى إدخال اسم المنتج")
      return
    }

    if (price < 0) {
      setError("لا يمكن أن يكون السعر بالسالب")
      return
    }

    // تحديد حالة المنتج تلقائياً إذا كان المخزون صفراً
    const finalStatus: ProductStatus = stock === 0 ? "نافد" : status

    if (product) {
      // تعديل منتج موجود
      updateProduct({
        ...product,
        name: name.trim(),
        category: category.trim(),
        price,
        stock,
        reorderPoint,
        status: finalStatus,
        image,
        accent,
      })
    } else {
      // إضافة منتج جديد بدون استخدام any
      addProduct({
        name: name.trim(),
        category: category.trim(),
        price,
        stock,
        reorderPoint,
        status: finalStatus,
        image,
      })
    }

    onDone()
  }

  return (
    <form className="space-y-4 rtl" onSubmit={handleSubmit}>
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">صورة المنتج</span>
        {image ? (
          <div className="relative h-32 w-full overflow-hidden rounded-lg border border-border bg-muted/30">
            <img src={image} alt="معاينة المنتج" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setImage("")}
              className="absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md hover:bg-destructive hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors">
            <ImagePlus className="mb-1.5 h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">اضغط لاختيار صورة من المعرض</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        )}
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">اسم المنتج *</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: فستان سهرة مخمل"
          className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none focus:border-ring focus:bg-background transition-colors"
        />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">التصنيف</span>
          <input
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="مثال: أزياء نسائية"
            className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none focus:border-ring focus:bg-background transition-colors"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">حالة العرض</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            disabled={stock === 0}
            className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none focus:border-ring focus:bg-background transition-colors cursor-pointer disabled:opacity-60"
          >
            <option value="منشور">منشور</option>
            <option value="مسودة">مسودة</option>
            {stock === 0 && <option value="نافد">نافد</option>}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
            السعر ({currency === "IQD" ? "د.ع" : "$"})
          </span>
          <input
            type="number"
            min={0}
            step={currency === "IQD" ? 250 : 1}
            required
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm font-mono outline-none focus:border-ring focus:bg-background transition-colors"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">المخزون الحالي</span>
          <input
            type="number"
            min={0}
            required
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm font-mono outline-none focus:border-ring focus:bg-background transition-colors"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">حد التنبيه للمخزون</span>
          <input
            type="number"
            min={1}
            required
            value={reorderPoint}
            onChange={(e) => setReorderPoint(Number(e.target.value))}
            className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm font-mono outline-none focus:border-ring focus:bg-background transition-colors"
          />
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button
          type="button"
          onClick={onDone}
          className="h-10 rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted transition-colors"
        >
          إلغاء
        </button>
        <button
          type="submit"
          className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {product ? "حفظ التعديلات" : "حفظ المنتج"}
        </button>
      </div>
    </form>
  )
}