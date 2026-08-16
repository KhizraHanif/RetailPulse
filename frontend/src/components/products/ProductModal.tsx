import { useEffect, useState } from "react"
import { X } from "lucide-react"


export type ProductFormData = {
  name: string
  sku: string
  category: string
  price: number
  quantity: number
  low_stock_threshold: number
}


type ProductModalProps = {
  open: boolean

  initialProduct?: ProductFormData | null

  onClose: () => void

  onSubmit: (
    product: ProductFormData
  ) => Promise<void>
}


function ProductModal({
  open,
  initialProduct,
  onClose,
  onSubmit,
}: ProductModalProps) {
  const [formData, setFormData] =
    useState<ProductFormData>({
      name: "",
      sku: "",
      category: "",
      price: 0,
      quantity: 0,
      low_stock_threshold: 5,
    })

  const [saving, setSaving] =
    useState(false)


  useEffect(() => {
    if (initialProduct) {
      setFormData(initialProduct)
    } else {
      setFormData({
        name: "",
        sku: "",
        category: "",
        price: 0,
        quantity: 0,
        low_stock_threshold: 5,
      })
    }
  }, [initialProduct, open])


  if (!open) {
    return null
  }


  function updateField(
    field: keyof ProductFormData,
    value: string | number
  ) {
    setFormData(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    )
  }


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setSaving(true)

    try {
      await onSubmit(formData)
    } finally {
      setSaving(false)
    }
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {initialProduct
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter product and inventory information.
            </p>
          </div>


          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X size={20} />
          </button>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Product name
            </label>

            <input
              value={formData.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value
                )
              }
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-gray-400"
            />
          </div>


          <div className="grid gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                SKU
              </label>

              <input
                value={formData.sku}
                onChange={(event) =>
                  updateField(
                    "sku",
                    event.target.value
                  )
                }
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
              />
            </div>


            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>

              <input
                value={formData.category}
                onChange={(event) =>
                  updateField(
                    "category",
                    event.target.value
                  )
                }
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
              />
            </div>

          </div>


          <div className="grid gap-4 sm:grid-cols-3">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(event) =>
                  updateField(
                    "price",
                    Number(
                      event.target.value
                    )
                  )
                }
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
              />
            </div>


            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Quantity
              </label>

              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(event) =>
                  updateField(
                    "quantity",
                    Number(
                      event.target.value
                    )
                  )
                }
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
              />
            </div>


            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Low stock
              </label>

              <input
                type="number"
                min="0"
                value={
                  formData.low_stock_threshold
                }
                onChange={(event) =>
                  updateField(
                    "low_stock_threshold",
                    Number(
                      event.target.value
                    )
                  )
                }
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
              />
            </div>

          </div>


          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : initialProduct
                  ? "Save Changes"
                  : "Add Product"}
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}


export default ProductModal