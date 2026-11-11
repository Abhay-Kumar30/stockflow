
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from './ProtectedRoute'
import Login from '../pages/auth/Login'
import Signup from '../pages/auth/Signup'
import AppLayout from '../components/layout/AppLayout'
import Dashboard from '../pages/dashboard/Dashboard'
import Products from '../pages/products/Products'
import ProductForm from '../pages/products/ProductForm'
import Settings from '../pages/settings/Settings'

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">{title}</h1>
  </div>
)

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
  path="/login"
  element={
    <PublicRoute>
      <Login />
    </PublicRoute>
  }
/>
        <Route
  path="/signup"
  element={
    <PublicRoute>
      <Signup />
    </PublicRoute>
  }
/>

        <Route element={<ProtectedRoute />}>
  <Route element={<AppLayout />}>
    <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
   <Route path="/products" element={<Products />} />
<Route path="/products/new" element={<ProductForm />} />
<Route path="/products/:productId/edit" element={<ProductForm />} />
    <Route path="/settings" element={<Settings />} />
  </Route>
</Route>

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
