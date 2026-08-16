type InventoryMovement = {
  id: number
  product_id: number
  product_name: string
  movement_type: string
  quantity_change: number
  reason: string
  created_at: string
}

type RecentMovementsProps = {
  movements: InventoryMovement[]
}

function RecentMovements({
  movements,
}: RecentMovementsProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Inventory Activity
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Latest inventory movements across the store
        </p>
      </div>

      {movements.length === 0 ? (
        <div className="p-6">
          <p className="text-sm text-gray-500">
            No inventory activity available.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3">
                  Product
                </th>

                <th className="px-6 py-3">
                  Type
                </th>

                <th className="px-6 py-3">
                  Change
                </th>

                <th className="px-6 py-3">
                  Reason
                </th>

                <th className="px-6 py-3">
                  Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {movements.map((movement) => (
                <tr
                  key={movement.id}
                  className="transition hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {movement.product_name}
                  </td>

                  <td className="px-6 py-4 text-sm capitalize text-gray-600">
                    {movement.movement_type}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={
                        movement.quantity_change < 0
                          ? "font-semibold text-red-600"
                          : "font-semibold text-green-600"
                      }
                    >
                      {movement.quantity_change > 0
                        ? "+"
                        : ""}
                      {movement.quantity_change}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {movement.reason}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(
                      movement.created_at
                    ).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default RecentMovements