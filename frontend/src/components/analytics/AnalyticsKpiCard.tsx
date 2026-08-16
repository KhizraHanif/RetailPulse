import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from "lucide-react"


type AnalyticsKpiCardProps = {
  title: string
  value: string
  change: number | null
  subtitle: string
}



function AnalyticsKpiCard({
  title,
  value,
  change,
  subtitle,
}: AnalyticsKpiCardProps) {


  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
        {value}
      </p>

      <div className="mt-3 flex items-center gap-2">

  {change === null ? (
    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
      New
    </span>
  ) : (
    <span
      className={`
        flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold
        ${
          change > 0
            ? "bg-emerald-50 text-emerald-700"
            : change < 0
              ? "bg-red-50 text-red-700"
              : "bg-gray-100 text-gray-600"
        }
      `}
    >
      {change > 0 && (
        <ArrowUpRight size={14} />
      )}

      {change < 0 && (
        <ArrowDownRight size={14} />
      )}

      {change === 0 && (
        <Minus size={14} />
      )}

      {Math.abs(change).toFixed(1)}%
    </span>
  )}

  <span className="text-xs text-gray-500">
    {subtitle}
  </span>

</div>

    </div>
  )
}


export default AnalyticsKpiCard