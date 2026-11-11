
import { useEffect, useState } from 'react'
import { Package, Boxes, AlertTriangle, RefreshCw } from 'lucide-react'
import { getDashboardSummary, type DashboardSummary } from '../../services/dashboard.service'

const Dashboard = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchSummary = async () => {
    try {
      setError('')
      setLoading(true)
      const data = await getDashboardSummary()
      setSummary(data)
    } catch {
      setError('Unable to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  const stats = [
    {
      title: 'Total Products',
      value: summary?.totalProducts ?? 0,
      icon: Package,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Total Quantity',
      value: summary?.totalQuantity ?? 0,
      icon: Boxes,
      color: 'text-violet-600 bg-violet-50',
    },
    {
      title: 'Low Stock Products',
      value: summary?.lowStockProducts ?? 0,
      icon: AlertTriangle,
      color: 'text-orange-600 bg-orange-50',
    },
  ]

  if (loading) {
    return <div className="py-12 text-center text-slate-500">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your inventory
          </p>
        </div>

        <button
          onClick={fetchSummary}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
          <button onClick={fetchSummary} className="ml-2 font-semibold underline">
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ title, value, icon: Icon, color }) => (
          <div
            key={title}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{title}</p>
              <div className={`rounded-lg p-3 ${color}`}>
                <Icon size={21} />
              </div>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Inventory Overview
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Your inventory currently contains {summary?.totalQuantity ?? 0} units
          across {summary?.totalProducts ?? 0} products.
        </p>
      </div>
    </div>
  )
}

export default Dashboard
