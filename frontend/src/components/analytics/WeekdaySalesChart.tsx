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


type WeekdaySale = {
  weekday: string
  orders: number
  revenue: number
}


type Props = {
  data: WeekdaySale[]
}


function WeekdaySalesChart({
  data,
}: Props) {
  const chartData = {
    labels: data.map(
      (item) =>
        item.weekday.slice(
          0,
          3
        )
    ),

    datasets: [
      {
        label: "Revenue",

        data: data.map(
          (item) =>
            item.revenue
        ),

        backgroundColor:
          "#0f172a",

        borderRadius: 6,
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
            `$${context.parsed.y.toFixed(
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
      },
    },
  }


  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="mb-5">

        <h3 className="text-base font-semibold text-gray-900">
          Sales by Day
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Revenue performance throughout the week
        </p>

      </div>


      <div className="h-64">

        <Bar
          data={chartData}
          options={options}
        />

      </div>

    </div>
  )
}


export default WeekdaySalesChart