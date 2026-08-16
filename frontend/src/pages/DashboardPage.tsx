import { useEffect, useState } from "react"

import LowStockPanel from "../components/dashboard/LowStockPanel"
import RecentMovements from "../components/dashboard/RecentMovements"
import RevenueChart from "../components/dashboard/RevenueChart"
import TopProducts from "../components/dashboard/TopProducts"
import StatCard from "../components/StatCard"
import { api } from "../services/api"


type DashboardSummary = {
  total_products: number
  total_stock: number
  low_stock_products: number
  total_orders: number
  total_revenue: number
}


type RevenueTrendItem = {
  date: string
  orders: number
  revenue: number
}


type TopProduct = {
  product_id: number
  name: string
  units_sold: number
  revenue: number
}


type LowStockProduct = {
  product_id: number
  name: string
  sku: string
  quantity: number
  low_stock_threshold: number
}


type InventoryMovement = {
  id: number
  product_id: number
  product_name: string
  movement_type: string
  quantity_change: number
  reason: string
  created_at: string
}


type DashboardPageProps = {
  token: string
  onLogout: () => void
}


function DashboardPage({
  token,
  onLogout,
}: DashboardPageProps) {
  const [summary, setSummary] =
    useState<DashboardSummary | null>(null)

  const [revenueTrend, setRevenueTrend] =
    useState<RevenueTrendItem[]>([])

  const [topProducts, setTopProducts] =
    useState<TopProduct[]>([])

  const [
    lowStockProducts,
    setLowStockProducts,
  ] = useState<LowStockProduct[]>([])

  const [
    recentMovements,
    setRecentMovements,
  ] = useState<InventoryMovement[]>([])

  const [loading, setLoading] =
    useState(false)

  const [
    dashboardError,
    setDashboardError,
  ] = useState("")


  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setDashboardError("")

      const authConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      try {
        const [
          summaryResponse,
          revenueResponse,
          topProductsResponse,
          lowStockResponse,
          movementsResponse,
        ] = await Promise.all([
          api.get(
            "/dashboard/summary",
            authConfig
          ),

          api.get(
            "/dashboard/revenue-trend?days=7",
            authConfig
          ),

          api.get(
            "/dashboard/top-products?limit=5",
            authConfig
          ),

          api.get(
            "/dashboard/low-stock?limit=5",
            authConfig
          ),

          api.get(
            "/dashboard/recent-movements?limit=8",
            authConfig
          ),
        ])

        setSummary(summaryResponse.data)

        setRevenueTrend(
          revenueResponse.data
        )

        setTopProducts(
          topProductsResponse.data
        )

        setLowStockProducts(
          lowStockResponse.data
        )

        setRecentMovements(
          movementsResponse.data
        )

      } catch (error: any) {
        console.error(
          "Dashboard loading failed:",
          error
        )

        if (
          error.response?.status === 401
        ) {
          onLogout()
          return
        }

        setDashboardError(
          "Unable to load dashboard data."
        )

      } finally {
        setLoading(false)
      }
    }

    loadDashboard()

  }, [token, onLogout])


  return (
    <section className="p-6">

      <div className="mb-6 flex items-start justify-between">

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Performance Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Monitor sales, inventory and operations.
          </p>
        </div>


        <button
          onClick={onLogout}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Logout
        </button>

      </div>


      {loading && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-sm text-gray-500">
            Loading dashboard...
          </p>
        </div>
      )}


      {dashboardError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {dashboardError}
          </p>
        </div>
      )}


      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Revenue"
            value={`$${summary.total_revenue.toLocaleString()}`}
            subtitle="Across completed orders"
          />

          <StatCard
            title="Orders"
            value={
              summary.total_orders.toString()
            }
            subtitle="Completed sales"
          />

          <StatCard
            title="Products"
            value={
              summary.total_products.toString()
            }
            subtitle={`${summary.total_stock} units in stock`}
          />

          <StatCard
            title="Low Stock"
            value={
              summary.low_stock_products.toString()
            }
            subtitle="Needs attention"
          />

        </div>
      )}


      <div className="mt-6">
        <RevenueChart
          data={revenueTrend}
        />
      </div>


      <div className="mt-6 grid gap-6 xl:grid-cols-2">

        <TopProducts
          products={topProducts}
        />

        <LowStockPanel
          products={lowStockProducts}
        />

      </div>


      <div className="mt-6">
        <RecentMovements
          movements={recentMovements}
        />
      </div>

    </section>
  )
}


export default DashboardPage