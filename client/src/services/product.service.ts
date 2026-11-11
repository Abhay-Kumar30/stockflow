
import api from './api'

export interface Product {
  _id: string
  name: string
  sku: string
  description: string
  quantity: number
  costPrice: number
  sellingPrice: number
  lowStockThreshold?: number
  createdAt: string
  updatedAt: string
}

export interface ProductInput {
  name: string
  sku: string
  description?: string
  quantity: number
  costPrice: number
  sellingPrice: number
  lowStockThreshold?: number
}

export const getProducts = async (search = '') => {
  const response = await api.get('/products', {
    params: { search },
  })
  return response.data
}

export const getProductById = async (productId: string) => {
  const response = await api.get(`/products/${productId}`)
  return response.data
}

export const createProduct = async (data: ProductInput) => {
  const response = await api.post('/products', data)
  return response.data
}

export const updateProduct = async (
  productId: string,
  data: Partial<ProductInput>
) => {
  const response = await api.put(`/products/${productId}`, data)
  return response.data
}

export const deleteProduct = async (productId: string) => {
  const response = await api.delete(`/products/${productId}`)
  return response.data
}
