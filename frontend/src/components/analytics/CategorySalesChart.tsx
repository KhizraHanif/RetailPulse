import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from "chart.js"

import { Doughnut } from "react-chartjs-2"


ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)


type CategorySale = {
  category: string
  units_sold: number
  revenue: number
}


type Props = {
  data: CategorySale[]
}


function CategorySalesChart({
  data,
}: Props) {
  const chartData = {
    labels: data.map(
      (item) =>
        item.category
    ),

    datasets: [
      {
        data: data.map(
          (item) =>
            item.revenue
        ),

        backgroundColor: [
          "#2563eb",
          "#14b8a6",
          "#f59e0b",
          "#8b5cf6",
          "#ef4444",
          "#64748b",
        ],

        borderWidth: 0,
      },
    ],
  }


  const options = {
    responsive: true,
    maintainAspectRatio: false,

    cutout: "68%",

    plugins: {
      legend: {
        position:
          "bottom" as const,

        labels: {
          boxWidth: 10,
          usePointStyle: true,
          padding: 16,
        },
      },

      tooltip: {
        callbacks: {
          label: (
            context: any
          ) => {
            return `${context.label}: $${context.parsed.toFixed(
              2
            )}`
          },
        },
      },
    },
  }


  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="mb-4">

        <h3 className="text-base font-semibold text-gray-900">
          Sales by Category
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Revenue contribution by product category
        </p>

      </div>


      <div className="h-72">

        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No category sales data.
          </div>
        ) : (
          <Doughnut
            data={chartData}
            options={options}
          />
        )}

      </div>

    </div>
  )
}


export default CategorySalesChart