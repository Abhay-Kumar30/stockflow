
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import {
  getSettings,
  updateSettings,
  type OrganizationSettings,
} from '../../services/settings.service'
import { useAuth } from '../../context/AuthContext'

const settingsSchema = z.object({
  name: z.string().trim().min(2, 'Organization name is required').max(100),
  defaultLowStockThreshold: z.coerce.number().int().min(0, 'Threshold cannot be negative'),
})

type SettingsFormData = z.infer<typeof settingsSchema>

const Settings = () => {
  const { refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '',
      defaultLowStockThreshold: 5,
    },
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettings()
        reset(settings)
      } catch {
        setServerError('Unable to load organization settings.')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [reset])

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setServerError('')
      setSuccessMessage('')

      await updateSettings(data)
      await refreshUser()

      setSuccessMessage('Settings updated successfully.')
    } catch (error: any) {
      setServerError(
        error.response?.data?.message || 'Unable to update settings.'
      )
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-slate-500">Loading settings...</div>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your organization preferences
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Organization Settings
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Configure your inventory management preferences.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Organization Name
          </label>
          <input
            {...register('name')}
            placeholder="Enter organization name"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Default Low-Stock Threshold
          </label>
          <input
            {...register('defaultLowStockThreshold')}
            type="number"
            min="0"
            step="1"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />
          <p className="mt-2 text-xs text-slate-500">
            Products at or below this quantity are considered low stock unless
            they have their own threshold.
          </p>
          {errors.defaultLowStockThreshold && (
            <p className="mt-1 text-sm text-red-600">
              {errors.defaultLowStockThreshold.message}
            </p>
          )}
        </div>

        {serverError && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {serverError}
          </p>
        )}

        {successMessage && (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {successMessage}
          </p>
        )}

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Save size={17} />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Settings
