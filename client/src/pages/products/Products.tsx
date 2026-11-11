
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Trash2, Pencil, RefreshCw } from 'lucide-react'
import {
  getProducts,
  deleteProduct,
  type Product,
} from '../../services/product.service'

const Products = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProducts = useCallback(async () => {
    try {
      setError('')
      setLoading(true)
      const response = await getProducts(search)
      setProducts(response.products)
    } catch {
      setError('Unable to load products.')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleDelete = async (productId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this product?')

    if (!confirmed) return

    try {
      await deleteProduct(productId)
      await fetchProducts()
    } catch {
      setError('Unable to delete product.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your inventory products
          </p>
        </div>

        <Link
          to="/products/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={fetchProducts}
          className="rounded-lg border border-slate-300 bg-white px-4 hover:bg-slate-50"
          aria-label="Refresh products"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-4 font-medium">Product</th>
              <th className="px-5 py-4 font-medium">SKU</th>
              <th className="px-5 py-4 font-medium">Quantity</th>
              <th className="px-5 py-4 font-medium">Cost Price</th>
              <th className="px-5 py-4 font-medium">Selling Price</th>
              <th className="px-5 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  No products found. Add your first product.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {product.description || 'No description'}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{product.sku}</td>
                  <td className="px-5 py-4 text-slate-600">{product.quantity}</td>
                  <td className="px-5 py-4 text-slate-600">
                    ₹{product.costPrice.toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    ₹{product.sellingPrice.toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/products/${product._id}/edit`}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil size={17} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Products
