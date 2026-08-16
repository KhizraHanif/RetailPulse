type LowStockProduct = {
  product_id: number
  name: string
  sku: string
  quantity: number
  low_stock_threshold: number
}

type LowStockPanelProps = {
  products: LowStockProduct[]
}

function LowStockPanel({
  products,
}: LowStockPanelProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Low Stock
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Products requiring attention
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl bg-green-50 p-4">
          <p className="text-sm font-medium text-green-700">
            Inventory levels look healthy.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.product_id}
              className="rounded-xl border border-red-100 bg-red-50/40 p-4 transition hover:bg-red-50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {product.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    SKU: {product.sku}
                  </p>
                </div>

                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                  Low
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Current stock
                </span>

                <span className="font-semibold text-gray-900">
                  {product.quantity} /{" "}
                  {product.low_stock_threshold}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LowStockPanel