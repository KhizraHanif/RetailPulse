import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js"

import { Line } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

type RevenueTrendItem = {
  date: string
  orders: number
  revenue: number
}

type RevenueChartProps = {
  data: RevenueTrendItem[]
}

function RevenueChart({ data }: RevenueChartProps) {
  const chartData = {
    labels: data.map((item) => item.date),

    datasets: [
      {
        label: "Revenue",
        data: data.map((item) => item.revenue),
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index" as const,
      intersect: false,
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Revenue: $${context.parsed.y.toFixed(2)}`
          },
        },
      },
    },

    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => `$${value}`,
        },
      },
    },
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Revenue Trend
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Revenue generated over time
          </p>
        </div>

        <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          Last 7 days
        </span>
      </div>

      <div className="h-80">
        <Line
          data={chartData}
          options={options}
        />
      </div>
    </div>
  )
}

export default RevenueChart