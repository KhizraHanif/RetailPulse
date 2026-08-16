import {
  useEffect,
  useState,
} from "react"

import {
  Plus,
  Search,
  Users,
} from "lucide-react"

import AddUserModal, {
  type NewUserData,
} from "../components/users/AddUserModal"

import { api } from "../services/api"


type User = {
  id: number
  name: string
  email: string
  role: string
  created_at: string
}


type UsersPageProps = {
  token: string
  currentUser: User
  onLogout: () => void
}


function UsersPage({
  token,
  currentUser,
  onLogout,
}: UsersPageProps) {
  const [users, setUsers] =
    useState<User[]>([])

  const [search, setSearch] =
    useState("")

  const [modalOpen, setModalOpen] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  const [success, setSuccess] =
    useState("")


  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }


  useEffect(() => {
    loadUsers()
  }, [token])


  async function loadUsers() {
    setLoading(true)
    setError("")

    try {
      const response =
        await api.get(
          "/users/",
          authConfig
        )

      setUsers(response.data)

    } catch (error: any) {
      console.error(
        "User loading failed:",
        error
      )

      if (
        error.response?.status === 401
      ) {
        onLogout()
        return
      }

      setError(
        error.response?.data?.detail ||
        "Unable to load users."
      )

    } finally {
      setLoading(false)
    }
  }


  async function createUser(
    data: NewUserData
  ) {
    setError("")
    setSuccess("")

    try {
      await api.post(
        "/users/",
        data,
        authConfig
      )

      setModalOpen(false)

      setSuccess(
        "Staff account created."
      )

      await loadUsers()

    } catch (error: any) {
      setError(
        error.response?.data?.detail ||
        "Unable to create user."
      )

      throw error
    }
  }


  async function changeRole(
    userId: number,
    role: string
  ) {
    setError("")
    setSuccess("")

    try {
      await api.patch(
        `/users/${userId}/role`,
        {
          role,
        },
        authConfig
      )

      setUsers(
        (previousUsers) =>
          previousUsers.map(
            (user) =>
              user.id === userId
                ? {
                    ...user,
                    role,
                  }
                : user
          )
      )

      setSuccess(
        "User role updated."
      )

    } catch (error: any) {
      setError(
        error.response?.data?.detail ||
        "Unable to update role."
      )
    }
  }


  const filteredUsers =
    users.filter((user) => {
      const query =
        search.trim().toLowerCase()

      if (!query) {
        return true
      }

      return (
        user.name
          .toLowerCase()
          .includes(query) ||

        user.email
          .toLowerCase()
          .includes(query) ||

        user.role
          .toLowerCase()
          .includes(query)
      )
    })


  function roleLabel(
    role: string
  ) {
    return role
      .replace("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  }


  return (
    <section className="p-6">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            User Management
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage staff accounts and access roles.
          </p>
        </div>


        <button
          onClick={() =>
            setModalOpen(true)
          }
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          <Plus size={17} />

          Add Staff
        </button>

      </div>


      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}


      {success && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm text-green-700">
            {success}
          </p>
        </div>
      )}


      <div className="mb-5 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">

        <Search
          size={18}
          className="text-gray-400"
        />

        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search by name, email or role..."
          className="w-full bg-transparent text-sm outline-none"
        />

      </div>


      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">

          <Users
            size={19}
            className="text-gray-500"
          />

          <p className="font-medium text-gray-900">
            {filteredUsers.length} users
          </p>

        </div>


        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading users...
          </div>

        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">

                <tr>
                  <th className="px-6 py-3">
                    User
                  </th>

                  <th className="px-6 py-3">
                    Email
                  </th>

                  <th className="px-6 py-3">
                    Role
                  </th>

                  <th className="px-6 py-3">
                    Joined
                  </th>
                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {filteredUsers.map(
                  (user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">

                        <p className="font-medium text-gray-900">
                          {user.name}
                        </p>

                        {user.id ===
                          currentUser.id && (
                          <p className="mt-1 text-xs text-gray-500">
                            You
                          </p>
                        )}

                      </td>


                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>


                      <td className="px-6 py-4">

                        {user.role ===
                        "owner" ? (

                          <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
                            Owner
                          </span>

                        ) : (

                          <select
                            value={user.role}
                            onChange={(event) =>
                              changeRole(
                                user.id,
                                event.target.value
                              )
                            }
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
                          >

                            <option value="manager">
                              Manager
                            </option>

                            <option value="warehouse_staff">
                              Warehouse Staff
                            </option>

                            <option value="cashier">
                              Cashier
                            </option>

                          </select>

                        )}

                      </td>


                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(
                          user.created_at
                        ).toLocaleDateString()}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>


      <AddUserModal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        onSubmit={createUser}
      />

    </section>
  )
}


export default UsersPage