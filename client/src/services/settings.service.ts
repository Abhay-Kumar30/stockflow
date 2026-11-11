
import api from './api'

export interface OrganizationSettings {
  name: string
  defaultLowStockThreshold: number
}

export const getSettings = async (): Promise<OrganizationSettings> => {
  const response = await api.get('/settings')
  return response.data.settings
}

export const updateSettings = async (
  data: Partial<OrganizationSettings>
): Promise<OrganizationSettings> => {
  const response = await api.put('/settings', data)
  return response.data.settings
}
