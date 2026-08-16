import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js"

import { Line } from "react-chartjs-2"


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
)


type RevenueItem = {
  date: string
  orders: number
  revenue: number
}


type Props = {
  data: RevenueItem[]
}


function SalesPerformanceChart({
  data,
}: Props) {
  const chartData = {
    labels: data.map(
      (item) =>
        new Date(
          item.date
        ).toLocaleDateString(
          undefined,
          {
            month: "short",
            day: "numeric",
          }
        )
    ),

    datasets: [
      {
        label: "Revenue",
        data: data.map(
          (item) =>
            item.revenue
        ),
        borderColor: "#2563eb",
        backgroundColor:
          "rgba(37, 99, 235, 0.08)",
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.35,
      },
    ],
  }


  const options = {
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
            `Revenue: $${context.parsed.y.toFixed(
              2
            )}`,
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          callback: (
            value: string | number
          ) =>
            `$${value}`,
        },
      },
    },
  }


  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="mb-5">

        <h3 className="text-base font-semibold text-gray-900">
          Sales Performance
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Revenue generated during the selected period
        </p>

      </div>


      <div className="h-72">

        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No sales data for this period.
          </div>
        ) : (
          <Line
            data={chartData}
            options={options}
          />
        )}

      </div>

    </div>
  )
}


export default SalesPerformanceChart