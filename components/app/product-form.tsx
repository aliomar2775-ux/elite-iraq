"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-state"
import { type Product } from "@/lib/data"
import { ImagePlus, X } from "lucide-react"

export function ProductForm({ product, onDone }: { product?: Product; onDone: () => void }) {
  const { addProduct, updateProduct } = useApp()
  const [name, setName] = useState(product?.name || "")
  const [category, setCategory] = useState(product?.category || "أزياء نسائية")
  const [price, setPrice] = useState(product?.price ?? 50000)
  const [stock, setStock] = useState(product?.stock ?? 10)
  const [image, setImage] = useState<string>(product?.image || "")

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

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (product) {
          // تعديل منتج موجود
          updateProduct({
            ...product,
            name,
            category,
            price,
            stock,
            status: stock === 0 ? "نافد" : "منشور",
            image,
          })
        } else {
          // إضافة منتج جديد
          addProduct({
            name,
            category,
            price,
            stock,
            status: stock === 0 ? "نافد" : "منشور",
            image,
            accent: "var(--chart-1)",
            sold: 0,
          } as any)
        }
        onDone()
      }}
    >
      <div>
        <span className="mb-1.5 block text-sm text-muted-foreground">صورة المنتج</span>
        {image ? (
          <div className="relative h-32 w-full overflow-hidden rounded-lg border border-border bg-muted/40">
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
          <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 hover:bg-muted/60 transition-colors">
            <ImagePlus className="mb-1.5 h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">اضغط لاختيار صورة من المعرض</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        )}
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">اسم المنتج</span>
        <input required value={name} onChange={(e) => setName(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none focus:border-ring" />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">التصنيف</span>
        <input required value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none focus:border-ring" />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">السعر (د.ع)</span>
          <input type="number" min={0} step={250} required value={price} onChange={(e) => setPrice(Number(e.target.value))} className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">المخزون</span>
          <input type="number" min={0} required value={stock} onChange={(e) => setStock(Number(e.target.value))} className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm" />
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onDone} className="h-10 rounded-lg border border-border px-4 text-sm">
          إلغاء
        </button>
        <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
          {product ? "حفظ التعديلات" : "حفظ المنتج"}
        </button>
      </div>
    </form>
  )
}