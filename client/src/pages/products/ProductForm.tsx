
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import {
  createProduct,
  getProductById,
  updateProduct,
  type ProductInput,
} from '../../services/product.service'

const productSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required').max(100),
  sku: z.string().trim().min(1, 'SKU is required').max(50),
  description: z.string().max(500).optional(),
  quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative'),
  costPrice: z.coerce.number().min(0, 'Cost price cannot be negative'),
  sellingPrice: z.coerce.number().min(0, 'Selling price cannot be negative'),
  lowStockThreshold: z.union([
    z.literal(''),
    z.coerce.number().int().min(0, 'Threshold cannot be negative'),
  ]).optional(),
})

type ProductFormData = z.infer<typeof productSchema>

const ProductForm = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(productId)

  const [loading, setLoading] = useState(isEditing)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      quantity: 0,
      costPrice: 0,
      sellingPrice: 0,
      lowStockThreshold: '',
    },
  })

  useEffect(() => {
    if (!productId) return

    const fetchProduct = async () => {
      try {
        const response = await getProductById(productId)
        const product = response.product

        reset({
          name: product.name,
          sku: product.sku,
          description: product.description || '',
          quantity: product.quantity,
          costPrice: product.costPrice,
          sellingPrice: product.sellingPrice,
          lowStockThreshold: product.lowStockThreshold ?? '',
        })
      } catch {
        setServerError('Unable to load product details.')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId, reset])

  const onSubmit = async (data: ProductFormData) => {
    try {
      setServerError('')

      const payload: ProductInput = {
        name: data.name,
        sku: data.sku,
        description: data.description || '',
        quantity: data.quantity,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        ...(data.lowStockThreshold !== '' &&
          data.lowStockThreshold !== undefined && {
            lowStockThreshold: Number(data.lowStockThreshold),
          }),
      }

      if (isEditing && productId) {
        await updateProduct(productId, payload)
      } else {
        await createProduct(payload)
      }

      navigate('/products')
    } catch (error: any) {
      setServerError(
        error.response?.data?.message || 'Unable to save product.'
      )
    }
  }

  if (loading) {
    return <div className="py-12 text-center">Loading product...</div>
  }

  const fields = [
    { name: 'name', label: 'Product Name', type: 'text', placeholder: 'Enter product name' },
    { name: 'sku', label: 'SKU', type: 'text', placeholder: 'Enter unique SKU' },
    { name: 'quantity', label: 'Quantity', type: 'number', placeholder: '0' },
    { name: 'costPrice', label: 'Cost Price (₹)', type: 'number', placeholder: '0.00' },
    { name: 'sellingPrice', label: 'Selling Price (₹)', type: 'number', placeholder: '0.00' },
    { name: 'lowStockThreshold', label: 'Low Stock Threshold (optional)', type: 'number', placeholder: 'Use organization default' },
  ] as const

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          to="/products"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>

        <h1 className="text-2xl font-bold text-slate-900">
          {isEditing ? 'Edit Product' : 'Add Product'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isEditing ? 'Update your product details' : 'Add a new item to your inventory'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((field) => {
            const fieldError = errors[field.name]

            return (
              <div key={field.name}>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {field.label}
                </label>
                <input
                  {...register(field.name)}
                  type={field.type}
                  min={field.type === 'number' ? 0 : undefined}
                  step={field.name === 'costPrice' || field.name === 'sellingPrice' ? '0.01' : '1'}
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
                {fieldError && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldError.message}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Enter product description"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        {serverError && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {serverError}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <Link
            to="/products"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm
