type StatCardProps = {
  title: string
  value: string
  subtitle?: string
}

function StatCard({
  title,
  value,
  subtitle,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </h2>

      {subtitle && (
        <p className="mt-2 text-xs text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default StatCard