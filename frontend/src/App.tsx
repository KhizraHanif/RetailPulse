import {
  useEffect,
  useState,
} from "react"

import {
  Navigate,
  Route,
  Routes,
} from "react-router"

import Header from "./components/layout/Header"
import Sidebar from "./components/layout/Sidebar"

import AnalyticsPage from "./pages/AnalyticsPage"
import DashboardPage from "./pages/DashboardPage"
import InventoryPage from "./pages/InventoryPage"
import LoginPage from "./pages/LoginPage"
import OrdersPage from "./pages/OrdersPage"
import ProductsPage from "./pages/ProductsPage"
import TasksPage from "./pages/TasksPage"
import UsersPage from "./pages/UsersPage"

import { api } from "./services/api"


type CurrentUser = {
  id: number
  name: string
  email: string
  role: string
  created_at: string
}


function App() {
  const [token, setToken] =
    useState<string | null>(() =>
      localStorage.getItem(
        "access_token"
      )
    )

  const [
    currentUser,
    setCurrentUser,
  ] = useState<CurrentUser | null>(
    null
  )

  const [
    loadingCurrentUser,
    setLoadingCurrentUser,
  ] = useState(
    Boolean(token)
  )

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false)


  /*
   * Whenever we have a token,
   * ask FastAPI who the logged-in user is.
   */
  useEffect(() => {
    if (!token) {
      setCurrentUser(null)
      setLoadingCurrentUser(false)

      return
    }


    async function loadCurrentUser() {
      setLoadingCurrentUser(true)

      try {
        const response =
          await api.get(
            "/auth/me",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        setCurrentUser(
          response.data
        )

      } catch (error: any) {
        console.error(
          "Unable to load current user:",
          error
        )

        if (
          error.response?.status === 401
        ) {
          localStorage.removeItem(
            "access_token"
          )

          setToken(null)
          setCurrentUser(null)
        }

      } finally {
        setLoadingCurrentUser(false)
      }
    }


    loadCurrentUser()

  }, [token])


  function toggleSidebar() {
    setSidebarCollapsed(
      (previousValue) =>
        !previousValue
    )
  }


  function handleLoginSuccess(
    newToken: string
  ) {
    /*
     * LoginPage already stores the
     * token in localStorage.
     *
     * Changing token causes the
     * useEffect above to call /auth/me.
     */
    setToken(newToken)
  }


  function handleLogout() {
    localStorage.removeItem(
      "access_token"
    )

    setToken(null)
    setCurrentUser(null)
  }


  /*
   * No token means the user must login.
   */
  if (!token) {
    return (
      <LoginPage
        onLoginSuccess={
          handleLoginSuccess
        }
      />
    )
  }


  /*
   * Prevent routing before we know
   * whether this user is an owner,
   * manager, warehouse worker, etc.
   */
  if (loadingCurrentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">

        <p className="text-sm text-gray-500">
          Loading RetailPulse...
        </p>

      </div>
    )
  }


  return (
    <div className="flex min-h-screen bg-gray-50">

      <Sidebar
        collapsed={
          sidebarCollapsed
        }
        userRole={
          currentUser?.role
        }
      />


      <main className="min-w-0 flex-1">

        <Header
          onToggleSidebar={
            toggleSidebar
          }
        />


        <Routes>

          <Route
            path="/dashboard"
            element={
              <DashboardPage
                token={token}
                onLogout={
                  handleLogout
                }
              />
            }
          />


          <Route
            path="/products"
            element={
              <ProductsPage
                token={token}
                onLogout={
                  handleLogout
                }
              />
            }
          />


          <Route
            path="/inventory"
            element={
              <InventoryPage
                token={token}
                onLogout={
                  handleLogout
                }
              />
            }
          />


          <Route
            path="/tasks"
            element={
              <TasksPage
                token={token}
                onLogout={
                  handleLogout
                }
              />
            }
          />


          <Route
            path="/orders"
            element={
              <OrdersPage
                token={token}
                onLogout={
                  handleLogout
                }
              />
            }
          />


          <Route
            path="/analytics"
            element={
              <AnalyticsPage />
            }
          />


          {/* Owner-only frontend route */}
          {currentUser?.role ===
            "owner" && (
            <Route
              path="/users"
              element={
                <UsersPage
                  token={token}
                  currentUser={
                    currentUser
                  }
                  onLogout={
                    handleLogout
                  }
                />
              }
            />
          )}


          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>

      </main>

    </div>
  )
}


export default App