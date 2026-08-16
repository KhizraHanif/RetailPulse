import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  AlertTriangle,
  Boxes,
  PackageCheck,
  Search,
  SlidersHorizontal,
} from "lucide-react"

import ThresholdModal from "../components/inventory/ThresholdModal"
import AdjustStockModal from "../components/inventory/AdjustStockModal"
import RecentMovements from "../components/dashboard/RecentMovements"

import { api } from "../services/api"


type Product = {
  id: number
  name: string
  sku: string
  category: string
  price: number
  quantity: number
  low_stock_threshold: number
}


type InventoryMovement = {
  id: number
  product_id: number
  product_name: string
  movement_type: string
  quantity_change: number
  reason: string
  created_at: string
}


type InventoryPageProps = {
  token: string
  onLogout: () => void
}


function InventoryPage({
  token,
  onLogout,
}: InventoryPageProps) {
  const [products, setProducts] =
    useState<Product[]>([])

  const [
    movements,
    setMovements,
  ] = useState<InventoryMovement[]>([])

  const [search, setSearch] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<Product | null>(null)

  const [
    adjustmentModalOpen,
    setAdjustmentModalOpen,
  ] = useState(false)


  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }


  useEffect(() => {
    loadInventory()
  }, [token])


  async function loadInventory() {
    setLoading(true)
    setError("")

    try {
      const [
        productsResponse,
        movementsResponse,
      ] = await Promise.all([
        api.get(
          "/products/",
          authConfig
        ),

        api.get(
          "/dashboard/recent-movements?limit=10",
          authConfig
        ),
      ])

      setProducts(
        productsResponse.data
      )

      setMovements(
        movementsResponse.data
      )

    } catch (error: any) {
      console.error(
        "Inventory loading failed:",
        error
      )

      if (
        error.response?.status === 401
      ) {
        onLogout()
        return
      }

      setError(
        "Unable to load inventory."
      )

    } finally {
      setLoading(false)
    }
  }


  const totalUnits = useMemo(
    () =>
      products.reduce(
        (total, product) =>
          total + product.quantity,
        0
      ),

    [products]
  )


  const lowStockCount = useMemo(
    () =>
      products.filter(
        (product) =>
          product.quantity > 0 &&
          product.quantity <=
            product.low_stock_threshold
      ).length,

    [products]
  )


  const outOfStockCount = useMemo(
    () =>
      products.filter(
        (product) =>
          product.quantity === 0
      ).length,

    [products]
  )



  const [
  thresholdModalOpen,
  setThresholdModalOpen,
] = useState(false)

const [
  thresholdProduct,
  setThresholdProduct,
] = useState<Product | null>(null)


  const filteredProducts =
    useMemo(() => {
      const query =
        search.trim().toLowerCase()

      if (!query) {
        return products
      }

      return products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(query) ||

          product.sku
            .toLowerCase()
            .includes(query) ||

          product.category
            .toLowerCase()
            .includes(query)
      )

    }, [products, search])


  function openAdjustmentModal(
    product: Product
  ) {
    setSelectedProduct(product)

    setAdjustmentModalOpen(true)
  }


  function closeAdjustmentModal() {
    setAdjustmentModalOpen(false)

    setSelectedProduct(null)
  }



  function openThresholdModal(
  product: Product
) {
  setThresholdProduct(product)
  setThresholdModalOpen(true)
}


    function closeThresholdModal() {
  setThresholdModalOpen(false)
  setThresholdProduct(null)
}



async function updateThreshold(
  threshold: number
) {
  if (!thresholdProduct) {
    return
  }

  try {
    await api.patch(
      `/products/${thresholdProduct.id}/threshold`,
      {
        low_stock_threshold:
          threshold,
      },
      authConfig
    )

    closeThresholdModal()

    await loadInventory()

  } catch (error: any) {
    console.error(
      "Threshold update failed:",
      error
    )

    setError(
      error.response?.data?.detail ||
        "Unable to update threshold."
    )

    throw error
  }
}
  async function adjustStock(
    quantityChange: number,
    reason: string
  ) {
    if (!selectedProduct) {
      return
    }

    try {
      await api.patch(
        `/products/${selectedProduct.id}/stock`,
        {
          quantity_change:
            quantityChange,

          reason,
        },
        authConfig
      )

      closeAdjustmentModal()

      await loadInventory()

    } catch (error: any) {
      console.error(
        "Stock update failed:",
        error
      )

      const message =
        error.response?.data?.detail

      setError(
        message ||
          "Unable to update stock."
      )

      throw error
    }
  }


  function getStockStatus(
    product: Product
  ) {
    if (product.quantity === 0) {
      return {
        label: "Out of stock",

        className:
          "bg-red-100 text-red-700",
      }
    }

    if (
      product.quantity <=
      product.low_stock_threshold
    ) {
      return {
        label: "Low stock",

        className:
          "bg-amber-100 text-amber-700",
      }
    }

    return {
      label: "Healthy",

      className:
        "bg-green-100 text-green-700",
    }
  }


  return (
    <section className="p-6">

      <div className="mb-6">

        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Inventory Management
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Monitor stock levels and record inventory adjustments.
        </p>

      </div>


      {/* Summary cards */}

      <div className="grid gap-4 md:grid-cols-3">

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Units
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {totalUnits}
              </p>
            </div>

            <div className="rounded-xl bg-gray-100 p-3">
              <Boxes
                size={21}
                className="text-gray-600"
              />
            </div>

          </div>

        </div>


        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Low Stock
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {lowStockCount}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-3">
              <AlertTriangle
                size={21}
                className="text-amber-600"
              />
            </div>

          </div>

        </div>


        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Out of Stock
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {outOfStockCount}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-3">
              <PackageCheck
                size={21}
                className="text-red-600"
              />
            </div>

          </div>

        </div>

      </div>


      {/* Search */}

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">

        <Search
          size={18}
          className="text-gray-400"
        />

        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search inventory by product, SKU or category..."
          className="w-full bg-transparent text-sm outline-none"
        />

      </div>


      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}


      {/* Inventory table */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">

          <div>
            <h3 className="font-semibold text-gray-900">
              Stock Levels
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {filteredProducts.length} products
            </p>
          </div>

        </div>


        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading inventory...
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
                    Category
                  </th>

                  <th className="px-6 py-3">
                    Current Stock
                  </th>

                  <th className="px-6 py-3">
                    Threshold
                  </th>

                  <th className="px-6 py-3">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {filteredProducts.map(
                  (product) => {
                    const status =
                      getStockStatus(
                        product
                      )

                    return (
                      <tr
                        key={product.id}
                        className="transition hover:bg-gray-50"
                      >

                        <td className="px-6 py-4">

                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {product.sku}
                          </p>

                        </td>


                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.category}
                        </td>


                        <td className="px-6 py-4">

                          <span className="text-lg font-semibold text-gray-900">
                            {product.quantity}
                          </span>

                        </td>


                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.low_stock_threshold}
                        </td>


                        <td className="px-6 py-4">

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>

                        </td>


                        <td className="px-6 py-4">

                          <div className="flex justify-end gap-2">

  <button
    onClick={() =>
      openAdjustmentModal(product)
    }
    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
  >
    <SlidersHorizontal size={16} />

    Adjust
  </button>


  <button
    onClick={() =>
      openThresholdModal(product)
    }
    className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
  >
    Threshold
  </button>

</div>

                        </td>

                      </tr>
                    )
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>


      {/* Movement history */}

      <div className="mt-6">

        <RecentMovements
          movements={movements}
        />

      </div>


      {/* Stock adjustment modal */}

      <AdjustStockModal
  open={adjustmentModalOpen}
  product={selectedProduct}
  onClose={closeAdjustmentModal}
  onSubmit={adjustStock}
/>


<ThresholdModal
  open={thresholdModalOpen}
  product={thresholdProduct}
  onClose={closeThresholdModal}
  onSubmit={updateThreshold}
/>

    </section>
  )
}


export default InventoryPage