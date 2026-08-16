import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js"

import { Bar } from "react-chartjs-2"


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
)


type ProductPerformance = {
  product_id: number
  name: string
  sku: string
  units_sold: number
  revenue: number
  quantity: number
  low_stock_threshold: number
}


type Props = {
  products: ProductPerformance[]
}


function ProductPerformanceChart({
  products,
}: Props) {
  const chartData = {
    labels: products.map(
      (product) =>
        product.name
    ),

    datasets: [
      {
        label: "Revenue",

        data: products.map(
          (product) =>
            product.revenue
        ),

        backgroundColor:
          "#2563eb",

        borderRadius: 6,

        barThickness: 20,
      },
    ],
  }


  const options = {
    indexAxis: "y" as const,

    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: (
            context: any
          ) =>
            `Revenue: $${context.parsed.x.toFixed(
              2
            )}`,
        },
      },
    },

    scales: {
      x: {
        beginAtZero: true,

        ticks: {
          callback: (
            value: string | number
          ) =>
            `$${value}`,
        },
      },

      y: {
        grid: {
          display: false,
        },
      },
    },
  }


  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="mb-5">

        <h3 className="text-base font-semibold text-gray-900">
          Product Performance
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Highest revenue-generating products
        </p>

      </div>


      <div className="h-72">

        {products.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No product sales data.
          </div>
        ) : (
          <Bar
            data={chartData}
            options={options}
          />
        )}

      </div>

    </div>
  )
}


export default ProductPerformanceChart