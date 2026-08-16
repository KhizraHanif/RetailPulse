import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react"

import CreateTaskModal from "../components/tasks/CreateTaskModal"
import { api } from "../services/api"


type CurrentUser = {
  id: number
  name: string
  email: string
  role: string
}


type Product = {
  id: number
  name: string
  sku: string
}


type AssignableUser = {
  id: number
  name: string
  email: string
  role: string
}


type Task = {
  id: number
  title: string
  description: string | null
  status: string
  category: string

  created_by_id: number
  assigned_to_id: number
  product_id: number

  created_at: string
  updated_at: string
}


type TaskFormData = {
  title: string
  description: string
  category: string
  assigned_to_id: number
  product_id: number
}


type TasksPageProps = {
  token: string
  onLogout: () => void
}


function TasksPage({
  token,
  onLogout,
}: TasksPageProps) {
  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null)

  const [tasks, setTasks] =
    useState<Task[]>([])

  const [products, setProducts] =
    useState<Product[]>([])

  const [
    assignableUsers,
    setAssignableUsers,
  ] = useState<AssignableUser[]>([])

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all")

  const [
    createModalOpen,
    setCreateModalOpen,
  ] = useState(false)

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
    loadTasksPage()
  }, [token])


  async function loadTasksPage() {
    setLoading(true)
    setError("")

    try {
      const meResponse =
        await api.get(
          "/auth/me",
          authConfig
        )

      const user =
        meResponse.data as CurrentUser

      setCurrentUser(user)


      const [
        tasksResponse,
        productsResponse,
      ] = await Promise.all([
        api.get(
          "/tasks/",
          authConfig
        ),

        api.get(
          "/products/",
          authConfig
        ),
      ])

      setTasks(
        tasksResponse.data
      )

      setProducts(
        productsResponse.data
      )


      if (
        user.role === "owner" ||
        user.role === "manager"
      ) {
        const usersResponse =
          await api.get(
            "/users/assignable",
            authConfig
          )

        setAssignableUsers(
          usersResponse.data
        )

      } else {
        setAssignableUsers([])
      }

    } catch (error: any) {
      console.error(
        "Tasks loading failed:",
        error
      )

      if (
        error.response?.status === 401
      ) {
        onLogout()
        return
      }

      if (
        error.response?.status === 403
      ) {
        setError(
          error.response?.data?.detail ||
          "You do not have permission to view tasks."
        )

        return
      }

      setError(
        "Unable to load tasks."
      )

    } finally {
      setLoading(false)
    }
  }


  const canManageTasks =
    currentUser?.role === "owner" ||
    currentUser?.role === "manager"


  const filteredTasks =
    useMemo(() => {
      if (statusFilter === "all") {
        return tasks
      }

      return tasks.filter(
        (task) =>
          task.status ===
          statusFilter
      )

    }, [tasks, statusFilter])


  const pendingCount =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.status === "pending"
        ).length,

      [tasks]
    )


  const inProgressCount =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.status ===
            "in_progress"
        ).length,

      [tasks]
    )


  const completedCount =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.status ===
            "completed"
        ).length,

      [tasks]
    )


  function productName(
    productId: number
  ) {
    return (
      products.find(
        (product) =>
          product.id === productId
      )?.name ??
      `Product #${productId}`
    )
  }


  function assigneeName(
    userId: number
  ) {
    if (
      currentUser?.id === userId
    ) {
      return currentUser.name
    }

    return (
      assignableUsers.find(
        (user) =>
          user.id === userId
      )?.name ??
      `User #${userId}`
    )
  }


  async function createTask(
    data: TaskFormData
  ) {
    try {
      await api.post(
        "/tasks/",
        data,
        authConfig
      )

      setCreateModalOpen(false)

      setSuccess(
        "Task created successfully."
      )

      await loadTasksPage()

    } catch (error: any) {
      console.error(
        "Task creation failed:",
        error
      )

      setError(
        error.response?.data?.detail ||
        "Unable to create task."
      )

      throw error
    }
  }


  async function updateStatus(
    taskId: number,
    status: string
  ) {
    setError("")
    setSuccess("")

    try {
      await api.put(
        `/tasks/${taskId}`,
        {
          status,
        },
        authConfig
      )

      setTasks(
        (previousTasks) =>
          previousTasks.map(
            (task) =>
              task.id === taskId
                ? {
                    ...task,
                    status,
                  }
                : task
          )
      )

      setSuccess(
        "Task status updated."
      )

    } catch (error: any) {
      console.error(
        "Task update failed:",
        error
      )

      setError(
        error.response?.data?.detail ||
        "Unable to update task."
      )
    }
  }


  async function deleteTask(
    task: Task
  ) {
    const confirmed =
      window.confirm(
        `Delete "${task.title}"?`
      )

    if (!confirmed) {
      return
    }

    setError("")
    setSuccess("")

    try {
      await api.delete(
        `/tasks/${task.id}`,
        authConfig
      )

      setTasks(
        (previousTasks) =>
          previousTasks.filter(
            (item) =>
              item.id !== task.id
          )
      )

      setSuccess(
        "Task deleted."
      )

    } catch (error: any) {
      console.error(
        "Task deletion failed:",
        error
      )

      setError(
        error.response?.data?.detail ||
        "Unable to delete task."
      )
    }
  }


  function statusClasses(
    status: string
  ) {
    if (status === "completed") {
      return (
        "bg-green-100 text-green-700"
      )
    }

    if (
      status === "in_progress"
    ) {
      return (
        "bg-blue-100 text-blue-700"
      )
    }

    return (
      "bg-amber-100 text-amber-700"
    )
  }


  return (
    <section className="p-6">

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Inventory Tasks
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Track and assign warehouse operations.
          </p>

        </div>


        {canManageTasks && (
          <button
            onClick={() =>
              setCreateModalOpen(true)
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <Plus size={17} />

            Create Task
          </button>
        )}

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


      <div className="grid gap-4 md:grid-cols-3">

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Pending
              </p>

              <p className="mt-2 text-3xl font-bold">
                {pendingCount}
              </p>
            </div>

            <Clock3 className="text-amber-500" />

          </div>

        </div>


        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                In Progress
              </p>

              <p className="mt-2 text-3xl font-bold">
                {inProgressCount}
              </p>
            </div>

            <LoaderCircle className="text-blue-500" />

          </div>

        </div>


        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Completed
              </p>

              <p className="mt-2 text-3xl font-bold">
                {completedCount}
              </p>
            </div>

            <CheckCircle2 className="text-green-500" />

          </div>

        </div>

      </div>


      <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

        <p className="text-sm font-medium text-gray-700">
          {filteredTasks.length} tasks
        </p>


        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
        >

          <option value="all">
            All statuses
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="in_progress">
            In Progress
          </option>

          <option value="completed">
            Completed
          </option>

        </select>

      </div>


      {loading ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Loading tasks...
        </div>

      ) : filteredTasks.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-10 text-center">

          <p className="font-medium text-gray-900">
            No tasks found
          </p>

          <p className="mt-1 text-sm text-gray-500">
            There are no tasks matching this status.
          </p>

        </div>

      ) : (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">

          {filteredTasks.map(
            (task) => (

              <div
                key={task.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <h3 className="font-semibold text-gray-900">
                      {task.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {productName(
                        task.product_id
                      )}
                    </p>

                  </div>


                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                      task.status
                    )}`}
                  >
                    {task.status.replace(
                      "_",
                      " "
                    )}
                  </span>

                </div>


                {task.description && (
                  <p className="mt-4 text-sm leading-6 text-gray-600">
                    {task.description}
                  </p>
                )}


                <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4">

                  <div>

                    <p className="text-xs text-gray-500">
                      Assigned to
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {assigneeName(
                        task.assigned_to_id
                      )}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-gray-500">
                      Category
                    </p>

                    <p className="mt-1 text-sm font-medium capitalize text-gray-900">
                      {task.category.replace(
                        "_",
                        " "
                      )}
                    </p>

                  </div>

                </div>


                <div className="mt-5 flex flex-wrap justify-end gap-2">

                  {task.status ===
                    "pending" && (
                    <button
                      onClick={() =>
                        updateStatus(
                          task.id,
                          "in_progress"
                        )
                      }
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Start Task
                    </button>
                  )}


                  {task.status !==
                    "completed" && (
                    <button
                      onClick={() =>
                        updateStatus(
                          task.id,
                          "completed"
                        )
                      }
                      className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      Complete
                    </button>
                  )}


                  {canManageTasks && (
                    <button
                      onClick={() =>
                        deleteTask(task)
                      }
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2
                        size={17}
                      />
                    </button>
                  )}

                </div>

              </div>
            )
          )}

        </div>
      )}


      <CreateTaskModal
        open={createModalOpen}
        products={products}
        users={assignableUsers}
        onClose={() =>
          setCreateModalOpen(false)
        }
        onSubmit={createTask}
      />

    </section>
  )
}


export default TasksPage