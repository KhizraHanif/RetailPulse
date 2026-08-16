import { useEffect, useState } from "react"
import { Minus, Plus, X } from "lucide-react"


type Product = {
  id: number
  name: string
  sku: string
  quantity: number
  low_stock_threshold: number
}


type AdjustStockModalProps = {
  open: boolean

  product: Product | null

  onClose: () => void

  onSubmit: (
    quantityChange: number,
    reason: string
  ) => Promise<void>
}


function AdjustStockModal({
  open,
  product,
  onClose,
  onSubmit,
}: AdjustStockModalProps) {
  const [mode, setMode] =
    useState<"add" | "remove">("add")

  const [quantity, setQuantity] =
    useState(1)

  const [reason, setReason] =
    useState("")

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState("")


  useEffect(() => {
    if (open) {
      setMode("add")
      setQuantity(1)
      setReason("")
      setError("")
    }
  }, [open])


  if (!open || !product) {
    return null
  }


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (quantity <= 0) {
      setError(
        "Quantity must be greater than zero."
      )

      return
    }

    const quantityChange =
      mode === "add"
        ? quantity
        : -quantity

    setSaving(true)
    setError("")

    try {
      await onSubmit(
        quantityChange,
        reason ||
          (
            mode === "add"
              ? "Manual restock"
              : "Manual inventory adjustment"
          )
      )

    } catch {
      setError(
        "Unable to update stock."
      )

    } finally {
      setSaving(false)
    }
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Adjust Stock
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {product.name} · {product.sku}
            </p>
          </div>


          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >

          <div className="rounded-xl bg-gray-50 p-4">

            <p className="text-sm text-gray-500">
              Current stock
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900">
              {product.quantity}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Low-stock threshold:{" "}
              {product.low_stock_threshold}
            </p>

          </div>


          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Adjustment type
            </label>


            <div className="grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() =>
                  setMode("add")
                }
                className={
                  mode === "add"
                    ? "flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white"
                    : "flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
                }
              >
                <Plus size={17} />

                Add Stock
              </button>


              <button
                type="button"
                onClick={() =>
                  setMode("remove")
                }
                className={
                  mode === "remove"
                    ? "flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white"
                    : "flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
                }
              >
                <Minus size={17} />

                Remove Stock
              </button>

            </div>

          </div>


          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(
                  Number(
                    event.target.value
                  )
                )
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-gray-400"
              required
            />

          </div>


          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Reason
            </label>

            <textarea
              value={reason}
              onChange={(event) =>
                setReason(
                  event.target.value
                )
              }
              placeholder={
                mode === "add"
                  ? "Example: Shipment received"
                  : "Example: Damaged inventory"
              }
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400"
            />

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
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              {saving
                ? "Updating..."
                : "Confirm Adjustment"}
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}


export default AdjustStockModal