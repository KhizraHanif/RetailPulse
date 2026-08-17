import {
  useEffect,
  useState,
} from "react"

import AnalyticsKpiCard from "../components/analytics/AnalyticsKpiCard"
import CategorySalesChart from "../components/analytics/CategorySalesChart"
import ProductPerformanceChart from "../components/analytics/ProductPerformanceChart"
import SalesPerformanceChart from "../components/analytics/SalesPerformanceChart"
import SignalsPanel from "../components/analytics/SignalsPanel"
import WeekdaySalesChart from "../components/analytics/WeekdaySalesChart"
import AnalyticsAssistant from "../components/analytics/AnalyticsAssistant"
import { api } from "../services/api"


type AnalyticsOverview = {
  period: {
    days: number
  }

  kpis: {
    revenue: number
    revenue_change: number

    orders: number
    orders_change: number

    average_order_value: number
    average_order_value_change: number

    units_sold: number
    units_sold_change: number
  }

  revenue_trend: {
    date: string
    orders: number
    revenue: number
  }[]

  category_sales: {
    category: string
    units_sold: number
    revenue: number
  }[]

  top_products: {
    product_id: number
    name: string
    sku: string
    units_sold: number
    revenue: number
    quantity: number
    low_stock_threshold: number
  }[]

  weekday_sales: {
    weekday: string
    orders: number
    revenue: number
  }[]

  signals: {
    type: string
    title: string
    message: string
  }[]
}


type AnalyticsPageProps = {
  token: string
  onLogout: () => void
}


function AnalyticsPage({
  token,
  onLogout,
}: AnalyticsPageProps) {
  const [days, setDays] =
    useState(30)

  const [
    analytics,
    setAnalytics,
  ] =
    useState<AnalyticsOverview | null>(
      null
    )

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")


  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true)
      setError("")

      try {
        const response =
          await api.get(
            `/analytics/overview?days=${days}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        setAnalytics(
          response.data
        )

      } catch (error: any) {
        console.error(
          "Analytics loading failed:",
          error
        )

        if (
          error.response?.status ===
          401
        ) {
          onLogout()
          return
        }

        if (
          error.response?.status ===
          403
        ) {
          setError(
            "You do not have permission to view business analytics."
          )

          return
        }

        setError(
          "Unable to load analytics."
        )

      } finally {
        setLoading(false)
      }
    }


    loadAnalytics()

  }, [
    days,
    token,
  ])


  return (
    <section className="p-6">

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Business Intelligence
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            Sales Analytics
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Understand revenue trends, product performance and important business signals.
          </p>

        </div>


        <div className="flex items-center gap-3">

          <span className="text-sm text-gray-500">
            Analysis period
          </span>

          <select
            value={days}
            onChange={(event) =>
              setDays(
                Number(
                  event.target.value
                )
              )
            }
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm outline-none"
          >

            <option value={7}>
              Last 7 days
            </option>

            <option value={30}>
              Last 30 days
            </option>

            <option value={90}>
              Last 90 days
            </option>

            <option value={365}>
              Last year
            </option>

          </select>

        </div>

      </div>


      {loading && (
        <div className="mb-5 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">

          <p className="text-sm text-gray-500">
            Updating analytics...
          </p>

        </div>
      )}


      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

          <p className="text-sm text-red-700">
            {error}
          </p>

        </div>
      )}


      {analytics && (
        <>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <AnalyticsKpiCard
              title="Revenue"
              value={`$${analytics.kpis.revenue.toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}`}
              change={
                analytics.kpis
                  .revenue_change
              }
              subtitle="vs previous period"
            />


            <AnalyticsKpiCard
              title="Orders"
              value={
                analytics.kpis.orders.toLocaleString()
              }
              change={
                analytics.kpis
                  .orders_change
              }
              subtitle="vs previous period"
            />


            <AnalyticsKpiCard
              title="Average Order"
              value={`$${analytics.kpis.average_order_value.toFixed(
                2
              )}`}
              change={
                analytics.kpis
                  .average_order_value_change
              }
              subtitle="vs previous period"
            />


            <AnalyticsKpiCard
              title="Units Sold"
              value={
                analytics.kpis.units_sold.toLocaleString()
              }
              change={
                analytics.kpis
                  .units_sold_change
              }
              subtitle="vs previous period"
            />

          </div>

          <div className="mt-6">

  <AnalyticsAssistant
    token={token}
    days={days}
    onLogout={onLogout}
  />

</div>


          <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">

            <SalesPerformanceChart
              data={
                analytics.revenue_trend
              }
            />

            <CategorySalesChart
              data={
                analytics.category_sales
              }
            />

          </div>


                   <div className="mt-6">

            <ProductPerformanceChart
              products={
                analytics.top_products
              }
            />

            <SignalsPanel
              signals={
                analytics.signals
              }
            />

          </div>


          <div className="mt-6">

            <WeekdaySalesChart
              data={
                analytics.weekday_sales
              }
            />

          </div>


        </>
      )}

    </section>
  )
}


export default AnalyticsPage
