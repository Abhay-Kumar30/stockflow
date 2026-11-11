
import api from './api'

export interface DashboardSummary {
  totalProducts: number
  totalQuantity: number
  lowStockProducts: number
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await api.get('/dashboard/summary')
  return response.data.summary
}
