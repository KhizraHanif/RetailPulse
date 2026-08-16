import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react"

import { api } from "../services/api"


type Product = {
  id: number
  name: string
  sku: string
  category: string
  price: number
  quantity: number
}


type CartItem = {
  product: Product
  quantity: number
}


type OrderItem = {
  id: number
  product_id: number
  quantity: number
  unit_price: number
  line_total: number
}


type Order = {
  id: number
  created_by_id: number
  status: string
  total_amount: number
  created_at: string
  items: OrderItem[]
}


type OrdersPageProps = {
  token: string
  onLogout: () => void
}


function OrdersPage({
  token,
  onLogout,
}: OrdersPageProps) {
  const [products, setProducts] =
    useState<Product[]>([])

  const [orders, setOrders] =
    useState<Order[]>([])

  const [cart, setCart] =
    useState<CartItem[]>([])

  const [search, setSearch] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] =
    useState("")

  const [success, setSuccess] =
    useState("")


  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }


  useEffect(() => {
    loadPage()
  }, [token])


  async function loadPage() {
    setLoading(true)
    setError("")

    try {
      const [
        productResponse,
        orderResponse,
      ] = await Promise.all([
        api.get(
          "/products/",
          authConfig
        ),

        api.get(
          "/orders/?limit=20",
          authConfig
        ),
      ])

      setProducts(
        productResponse.data
      )

      setOrders(
        orderResponse.data
      )

    } catch (error: any) {
      console.error(
        "Orders loading failed:",
        error
      )

      if (
        error.response?.status === 401
      ) {
        onLogout()
        return
      }

      setError(
        "Unable to load orders."
      )

    } finally {
      setLoading(false)
    }
  }


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


  const cartTotal =
    useMemo(() => {
      return cart.reduce(
        (total, item) =>
          total +
          Number(item.product.price) *
            item.quantity,

        0
      )
    }, [cart])


  function addToCart(
    product: Product
  ) {
    setError("")
    setSuccess("")

    if (product.quantity <= 0) {
      setError(
        `${product.name} is out of stock.`
      )

      return
    }

    setCart(
      (previousCart) => {
        const existing =
          previousCart.find(
            (item) =>
              item.product.id ===
              product.id
          )

        if (existing) {
          if (
            existing.quantity >=
            product.quantity
          ) {
            setError(
              `Only ${product.quantity} units of ${product.name} are available.`
            )

            return previousCart
          }

          return previousCart.map(
            (item) =>
              item.product.id ===
              product.id

                ? {
                    ...item,
                    quantity:
                      item.quantity + 1,
                  }

                : item
          )
        }

        return [
          ...previousCart,
          {
            product,
            quantity: 1,
          },
        ]
      }
    )
  }


  function changeQuantity(
    productId: number,
    change: number
  ) {
    setCart(
      (previousCart) =>
        previousCart
          .map((item) => {
            if (
              item.product.id !==
              productId
            ) {
              return item
            }

            const nextQuantity =
              item.quantity + change

            if (nextQuantity <= 0) {
              return {
                ...item,
                quantity: 0,
              }
            }

            if (
              nextQuantity >
              item.product.quantity
            ) {
              setError(
                `Only ${item.product.quantity} units of ${item.product.name} are available.`
              )

              return item
            }

            return {
              ...item,
              quantity:
                nextQuantity,
            }
          })
          .filter(
            (item) =>
              item.quantity > 0
          )
    )
  }


  function removeFromCart(
    productId: number
  ) {
    setCart(
      (previousCart) =>
        previousCart.filter(
          (item) =>
            item.product.id !==
            productId
        )
    )
  }


  async function createOrder() {
    if (cart.length === 0) {
      setError(
        "Add at least one product to the order."
      )

      return
    }

    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const payload = {
        items: cart.map(
          (item) => ({
            product_id:
              item.product.id,

            quantity:
              item.quantity,
          })
        ),
      }

      const response =
        await api.post(
          "/orders/",
          payload,
          authConfig
        )

      setSuccess(
        `Order #${response.data.id} completed successfully.`
      )

      setCart([])

      await loadPage()

    } catch (error: any) {
      console.error(
        "Order creation failed:",
        error
      )

      if (
        error.response?.status === 401
      ) {
        onLogout()
        return
      }

      if (
        error.response?.status === 403
      ) {
        setError(
          "Your role does not have permission to create orders."
        )

        return
      }

      setError(
        error.response?.data?.detail ||
          "Unable to create order."
      )

    } finally {
      setSubmitting(false)
    }
  }


  function productName(
    productId: number
  ) {
    return (
      products.find(
        (product) =>
          product.id === productId
      )?.name ??
      `Product #${productId}`
    )
  }


  return (
    <section className="p-6">

      <div className="mb-6">

        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Orders
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Create sales orders and review recent transactions.
        </p>

      </div>


      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}


      {success && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm text-green-700">
            {success}
          </p>
        </div>
      )}


      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">

        {/* Product selector */}

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 p-5">

            <h3 className="font-semibold text-gray-900">
              Products
            </h3>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">

              <Search
                size={17}
                className="text-gray-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search products..."
                className="w-full bg-transparent text-sm outline-none"
              />

            </div>

          </div>


          <div className="grid gap-3 p-5 md:grid-cols-2">

            {filteredProducts.map(
              (product) => (
                <button
                  key={product.id}

                  onClick={() =>
                    addToCart(
                      product
                    )
                  }

                  disabled={
                    product.quantity === 0
                  }

                  className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <div className="flex justify-between gap-4">

                    <div>
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {product.sku}
                      </p>
                    </div>

                    <p className="font-semibold text-gray-900">
                      $
                      {Number(
                        product.price
                      ).toFixed(2)}
                    </p>

                  </div>


                  <div className="mt-4 flex items-center justify-between">

                    <span className="text-xs text-gray-500">
                      {product.category}
                    </span>

                    <span
                      className={
                        product.quantity === 0
                          ? "text-xs font-medium text-red-600"
                          : "text-xs font-medium text-green-600"
                      }
                    >
                      {product.quantity} in stock
                    </span>

                  </div>

                </button>
              )
            )}

          </div>

        </div>


        {/* Cart */}

        <div className="h-fit rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex items-center gap-3 border-b border-gray-100 p-5">

            <ShoppingCart
              size={20}
            />

            <div>
              <h3 className="font-semibold text-gray-900">
                Current Order
              </h3>

              <p className="text-sm text-gray-500">
                {cart.length} items
              </p>
            </div>

          </div>


          {cart.length === 0 ? (
            <div className="p-8 text-center">

              <ShoppingCart
                size={32}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 text-sm text-gray-500">
                Select products to start an order.
              </p>

            </div>

          ) : (
            <div className="divide-y divide-gray-100">

              {cart.map(
                (item) => (
                  <div
                    key={
                      item.product.id
                    }
                    className="p-4"
                  >

                    <div className="flex justify-between gap-3">

                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.product.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          $
                          {Number(
                            item.product.price
                          ).toFixed(2)}
                          {" "}each
                        </p>
                      </div>


                      <button
                        onClick={() =>
                          removeFromCart(
                            item.product.id
                          )
                        }
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2
                          size={16}
                        />
                      </button>

                    </div>


                    <div className="mt-4 flex items-center justify-between">

                      <div className="flex items-center gap-2">

                        <button
                          onClick={() =>
                            changeQuantity(
                              item.product.id,
                              -1
                            )
                          }
                          className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50"
                        >
                          <Minus
                            size={14}
                          />
                        </button>


                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>


                        <button
                          onClick={() =>
                            changeQuantity(
                              item.product.id,
                              1
                            )
                          }
                          className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50"
                        >
                          <Plus
                            size={14}
                          />
                        </button>

                      </div>


                      <p className="font-semibold text-gray-900">
                        $
                        {(
                          Number(
                            item.product.price
                          ) *
                          item.quantity
                        ).toFixed(2)}
                      </p>

                    </div>

                  </div>
                )
              )}

            </div>
          )}


          <div className="border-t border-gray-100 p-5">

            <div className="mb-4 flex items-center justify-between">

              <span className="font-medium text-gray-600">
                Total
              </span>

              <span className="text-2xl font-bold text-gray-900">
                $
                {cartTotal.toFixed(2)}
              </span>

            </div>


            <button
              onClick={
                createOrder
              }

              disabled={
                cart.length === 0 ||
                submitting
              }

              className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Processing..."
                : "Complete Order"}
            </button>

          </div>

        </div>

      </div>


      {/* Order history */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-100 p-5">

          <h3 className="font-semibold text-gray-900">
            Recent Orders
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Latest completed sales transactions
          </p>

        </div>


        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading orders...
          </div>

        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">

                <tr>

                  <th className="px-6 py-3">
                    Order
                  </th>

                  <th className="px-6 py-3">
                    Items
                  </th>

                  <th className="px-6 py-3">
                    Total
                  </th>

                  <th className="px-6 py-3">
                    Status
                  </th>

                  <th className="px-6 py-3">
                    Date
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {orders.map(
                  (order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4 font-semibold text-gray-900">
                        #{order.id}
                      </td>


                      <td className="px-6 py-4">

                        <div className="space-y-1">

                          {order.items.map(
                            (item) => (
                              <p
                                key={item.id}
                                className="text-sm text-gray-600"
                              >
                                {
                                  productName(
                                    item.product_id
                                  )
                                }
                                {" × "}
                                {
                                  item.quantity
                                }
                              </p>
                            )
                          )}

                        </div>

                      </td>


                      <td className="px-6 py-4 font-semibold text-gray-900">
                        $
                        {Number(
                          order.total_amount
                        ).toFixed(2)}
                      </td>


                      <td className="px-6 py-4">

                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold capitalize text-green-700">
                          {order.status}
                        </span>

                      </td>


                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(
                          order.created_at
                        ).toLocaleString()}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </section>
  )
}


export default OrdersPage