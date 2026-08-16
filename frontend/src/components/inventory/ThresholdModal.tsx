import { useEffect, useState } from "react"
import { X } from "lucide-react"


type Product = {
  id: number
  name: string
  sku: string
  quantity: number
  low_stock_threshold: number
}


type ThresholdModalProps = {
  open: boolean
  product: Product | null
  onClose: () => void
  onSubmit: (
    threshold: number
  ) => Promise<void>
}


function ThresholdModal({
  open,
  product,
  onClose,
  onSubmit,
}: ThresholdModalProps) {
  const [threshold, setThreshold] =
    useState(0)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState("")


  useEffect(() => {
    if (open && product) {
      setThreshold(
        product.low_stock_threshold
      )

      setError("")
    }
  }, [open, product])


  if (!open || !product) {
    return null
  }


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (threshold < 0) {
      setError(
        "Threshold cannot be negative."
      )

      return
    }

    setSaving(true)
    setError("")

    try {
      await onSubmit(threshold)
    } catch {
      setError(
        "Unable to update threshold."
      )
    } finally {
      setSaving(false)
    }
  }


  const becomesLowStock =
    product.quantity <= threshold


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Set Low-Stock Threshold
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {product.name} · {product.sku}
            </p>
          </div>


          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Current stock
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {product.quantity}
              </p>
            </div>


            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Current threshold
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {product.low_stock_threshold}
              </p>
            </div>

          </div>


          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              New threshold
            </label>

            <input
              type="number"
              min="0"
              value={threshold}
              onChange={(event) =>
                setThreshold(
                  Number(event.target.value)
                )
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-gray-400"
              required
            />
          </div>


          <div
            className={
              becomesLowStock
                ? "rounded-xl bg-amber-50 px-4 py-3"
                : "rounded-xl bg-green-50 px-4 py-3"
            }
          >
            <p
              className={
                becomesLowStock
                  ? "text-sm font-medium text-amber-700"
                  : "text-sm font-medium text-green-700"
              }
            >
              {becomesLowStock
                ? "This product will be considered low stock."
                : "This product will remain healthy."}
            </p>
          </div>


          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          )}


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
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {saving
                ? "Updating..."
                : "Update Threshold"}
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}


export default ThresholdModal