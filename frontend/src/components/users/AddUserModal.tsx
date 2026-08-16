import { useState } from "react"
import { X } from "lucide-react"


export type NewUserData = {
  name: string
  email: string
  password: string
  role:
    | "manager"
    | "warehouse_staff"
    | "cashier"
}


type AddUserModalProps = {
  open: boolean
  onClose: () => void

  onSubmit: (
    data: NewUserData
  ) => Promise<void>
}


function AddUserModal({
  open,
  onClose,
  onSubmit,
}: AddUserModalProps) {
  const [name, setName] =
    useState("")

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [role, setRole] =
    useState<NewUserData["role"]>(
      "warehouse_staff"
    )

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState("")


  if (!open) {
    return null
  }


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setSaving(true)
    setError("")

    try {
      await onSubmit({
        name,
        email,
        password,
        role,
      })

      setName("")
      setEmail("")
      setPassword("")
      setRole("warehouse_staff")

    } catch {
      setError(
        "Unable to create user."
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
              Add Staff Member
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create a RetailPulse account for an employee.
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
              Name
            </label>

            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
              minLength={2}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
            />
          </div>


          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
            />
          </div>


          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Temporary Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              minLength={8}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
            />

            <p className="mt-2 text-xs text-gray-500">
              Minimum 8 characters.
            </p>
          </div>


          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Role
            </label>

            <select
              value={role}
              onChange={(event) =>
                setRole(
                  event.target.value as NewUserData["role"]
                )
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none"
            >
              <option value="warehouse_staff">
                Warehouse Staff
              </option>

              <option value="manager">
                Manager
              </option>

              <option value="cashier">
                Cashier
              </option>
            </select>
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
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving
                ? "Creating..."
                : "Create User"}
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}


export default AddUserModal