type TopProduct = {
  product_id: number
  name: string
  units_sold: number
  revenue: number
}

type TopProductsProps = {
  products: TopProduct[]
}

function TopProducts({ products }: TopProductsProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Top Products
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Best performing products by units sold
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-gray-500">
          No sales data available.
        </p>
      ) : (
        <div className="space-y-3">
          {products.map((product, index) => (
            <div
              key={product.product_id}
              className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">
                  {index + 1}
                </div>

                <div>
                  <p className="font-medium text-gray-900">
                    {product.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {product.units_sold} units sold
                  </p>
                </div>
              </div>

              <p className="font-semibold text-gray-900">
                ${product.revenue.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TopProducts