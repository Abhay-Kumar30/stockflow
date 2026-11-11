
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, Settings } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Settings', path: '/settings', icon: Settings },
]

const Sidebar = () => {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <h1 className="text-2xl font-bold text-blue-600">StockFlow</h1>
        <p className="mt-1 text-xs text-slate-500">Inventory Management</p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navigation.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <Icon size={19} />
            {name}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <p className="text-xs text-slate-400">StockFlow MVP</p>
      </div>
    </aside>
  )
}

export default Sidebar
