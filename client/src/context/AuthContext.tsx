
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  getCurrentUser,
  login as loginService,
  logout as logoutService,
  signup as signupService,
  type LoginData,
  type SignupData,
} from '../services/auth.service'

interface User {
  id: string
  name: string
  email: string
  organizationId: string
}

interface Organization {
  id: string
  name: string
  defaultLowStockThreshold: number
}

interface AuthContextType {
  user: User | null
  organization: Organization | null
  loading: boolean
  isAuthenticated: boolean
  login: (data: LoginData) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const response = await getCurrentUser()
      setUser(response.user)
      setOrganization(response.organization)
    } catch {
      setUser(null)
      setOrganization(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (data: LoginData) => {
    await loginService(data)
    await refreshUser()
  }

  const signup = async (data: SignupData) => {
    await signupService(data)
    await refreshUser()
  }

  const logout = async () => {
    await logoutService()
    setUser(null)
    setOrganization(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        loading,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
