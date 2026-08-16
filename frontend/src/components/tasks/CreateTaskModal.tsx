import { useEffect, useState } from "react"
import { X } from "lucide-react"


type Product = {
  id: number
  name: string
  sku: string
}


type User = {
  id: number
  name: string
  email: string
  role: string
}


type TaskFormData = {
  title: string
  description: string
  category: string
  assigned_to_id: number
  product_id: number
}


type CreateTaskModalProps = {
  open: boolean
  products: Product[]
  users: User[]
  onClose: () => void
  onSubmit: (
    data: TaskFormData
  ) => Promise<void>
}


function CreateTaskModal({
  open,
  products,
  users,
  onClose,
  onSubmit,
}: CreateTaskModalProps) {
  const [title, setTitle] =
    useState("")

  const [description, setDescription] =
    useState("")

  const [category, setCategory] =
    useState("restock")

  const [
    assignedToId,
    setAssignedToId,
  ] = useState(0)

  const [
    productId,
    setProductId,
  ] = useState(0)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState("")


  useEffect(() => {
    if (!open) {
      return
    }

    setTitle("")
    setDescription("")
    setCategory("restock")
    setAssignedToId(
      users[0]?.id ?? 0
    )
    setProductId(
      products[0]?.id ?? 0
    )
    setError("")
  }, [open, users, products])


  if (!open) {
    return null
  }


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (
      !assignedToId ||
      !productId
    ) {
      setError(
        "Select a product and assignee."
      )

      return
    }

    setSaving(true)
    setError("")

    try {
      await onSubmit({
        title,
        description,
        category,
        assigned_to_id:
          assignedToId,
        product_id:
          productId,
      })

    } catch {
      setError(
        "Unable to create task."
      )

    } finally {
      setSaving(false)
    }
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">

        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Create Inventory Task
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Assign warehouse work to a staff member.
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
              Task title
            </label>

            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Restock Wireless Mouse"
              minLength={3}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
            />

          </div>


          <div className="grid gap-4 sm:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Product
              </label>

              <select
                value={productId}
                onChange={(event) =>
                  setProductId(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none"
              >
                {products.map(
                  (product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name} — {product.sku}
                    </option>
                  )
                )}
              </select>

            </div>


            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Assign to
              </label>

              <select
                value={assignedToId}
                onChange={(event) =>
                  setAssignedToId(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none"
              >
                {users.map(
                  (user) => (
                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.name}
                    </option>
                  )
                )}
              </select>

            </div>

          </div>


          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none"
            >

              <option value="restock">
                Restock
              </option>

              <option value="stock_check">
                Stock Check
              </option>

              <option value="organization">
                Organization
              </option>

              <option value="general">
                General
              </option>

            </select>

          </div>


          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              rows={4}
              placeholder="Add instructions for the warehouse team..."
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
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
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={
                saving ||
                products.length === 0 ||
                users.length === 0
              }
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving
                ? "Creating..."
                : "Create Task"}
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}


export default CreateTaskModal