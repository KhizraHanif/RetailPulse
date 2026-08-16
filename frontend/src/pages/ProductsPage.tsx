import { useEffect, useMemo, useState } from "react"
import {
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"

import ProductModal, {
  type ProductFormData,
} from "../components/products/ProductModal"

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


type ProductsPageProps = {
  token: string
  onLogout: () => void
}


function ProductsPage({
  token,
  onLogout,
}: ProductsPageProps) {
  const [products, setProducts] =
    useState<Product[]>([])

  const [search, setSearch] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  const [modalOpen, setModalOpen] =
    useState(false)

  const [
    editingProduct,
    setEditingProduct,
  ] = useState<Product | null>(null)


  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }


  useEffect(() => {
    loadProducts()
  }, [token])


  async function loadProducts() {
    setLoading(true)
    setError("")

    try {
      const response = await api.get(
        "/products",
        authConfig
      )

      setProducts(response.data)

    } catch (error: any) {
      console.error(
        "Products loading failed:",
        error
      )

      if (
        error.response?.status === 401
      ) {
        onLogout()
        return
      }

      setError(
        "Unable to load products."
      )

    } finally {
      setLoading(false)
    }
  }


  const filteredProducts = useMemo(() => {
  const query = search.trim().toLowerCase()

  if (!query) {
    return products
  }

  return products.filter((product) => {
    const name = product.name?.toLowerCase() ?? ""
    const sku = product.sku?.toLowerCase() ?? ""
    const category = product.category?.toLowerCase() ?? ""

    const price = Number(product.price).toFixed(2)

    return (
      name.includes(query) ||
      sku.includes(query) ||
      category.includes(query) ||
      price.includes(query)
    )
  })
}, [products, search])

  function openCreateModal() {
    setEditingProduct(null)
    setModalOpen(true)
  }


  function openEditModal(
    product: Product
  ) {
    setEditingProduct(product)
    setModalOpen(true)
  }


  function closeModal() {
    setModalOpen(false)
    setEditingProduct(null)
  }


  async function saveProduct(
    formData: ProductFormData
  ) {
    try {
      if (editingProduct) {
        await api.put(
          `/products/${editingProduct.id}`,
          formData,
          authConfig
        )
      } else {
        await api.post(
          "/products",
          formData,
          authConfig
        )
      }

      closeModal()

      await loadProducts()

    } catch (error) {
      console.error(
        "Saving product failed:",
        error
      )

      setError(
        "Unable to save product."
      )

      throw error
    }
  }


  async function deleteProduct(
    product: Product
  ) {
    const confirmed =
      window.confirm(
        `Delete "${product.name}"?`
      )

    if (!confirmed) {
      return
    }

    try {
      await api.delete(
        `/products/${product.id}`,
        authConfig
      )

      setProducts(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== product.id
          )
      )

    } catch (error) {
      console.error(
        "Delete failed:",
        error
      )

      setError(
        "Unable to delete product."
      )
    }
  }


  return (
    <section className="p-6">

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Product Catalogue
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage products, pricing and stock information.
          </p>
        </div>


        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <Plus size={17} />

          Add Product
        </button>

      </div>


      <div className="mb-5 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">

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
          placeholder="Search by name, SKU or category..."
          className="w-full bg-transparent text-sm outline-none"
        />

      </div>


      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}


      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-100 px-6 py-4">
          <p className="text-sm text-gray-500">
            {filteredProducts.length} products
          </p>
        </div>


        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading products...
          </div>

        ) : filteredProducts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-900">
              No products found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Try another search or add a product.
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
                    Category
                  </th>

                  <th className="px-6 py-3">
                    Price
                  </th>

                  <th className="px-6 py-3">
                    Stock
                  </th>

                  <th className="px-6 py-3">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right">
                    Actions
                  </th>
                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {filteredProducts.map(
                  (product) => {
                    const isLowStock =
                      product.quantity <=
                      product.low_stock_threshold

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


                        <td className="px-6 py-4 font-medium text-gray-900">
                          $
                          {Number(
                            product.price
                          ).toFixed(2)}
                        </td>


                        <td className="px-6 py-4 text-sm text-gray-700">
                          {product.quantity}
                        </td>


                        <td className="px-6 py-4">

                          <span
                            className={
                              isLowStock
                                ? "rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700"
                                : "rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700"
                            }
                          >
                            {isLowStock
                              ? "Low stock"
                              : "In stock"}
                          </span>

                        </td>


                        <td className="px-6 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                openEditModal(
                                  product
                                )
                              }
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                              title="Edit product"
                            >
                              <Pencil
                                size={17}
                              />
                            </button>


                            <button
                              onClick={() =>
                                deleteProduct(
                                  product
                                )
                              }
                              className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                              title="Delete product"
                            >
                              <Trash2
                                size={17}
                              />
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


      <ProductModal
        open={modalOpen}

        initialProduct={
          editingProduct
            ? {
                name:
                  editingProduct.name,

                sku:
                  editingProduct.sku,

                category:
                  editingProduct.category,

                price:
                  Number(
                    editingProduct.price
                  ),

                quantity:
                  editingProduct.quantity,

                low_stock_threshold:
                  editingProduct.low_stock_threshold,
              }
            : null
        }

        onClose={closeModal}

        onSubmit={saveProduct}
      />

    </section>
  )
}


export default ProductsPage