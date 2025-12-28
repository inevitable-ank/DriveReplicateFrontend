"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "@/lib/types"
import { setUserSession, getUserSession, clearUserSession, setToken, getToken } from "@/lib/utils/auth"
import { authAPI } from "@/lib/api"

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  signup: (name: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => void
  logout: () => void
  isAuthenticated: boolean
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user from token on mount
  useEffect(() => {
    const storedToken = getToken()
    if (storedToken) {
      setTokenState(storedToken)
      // Verify token and get user from backend
      authAPI.getCurrentUser()
        .then((userData) => {
          setUserState(userData)
          setUserSession(userData)
        })
        .catch(() => {
          // Token invalid, clear it
          clearUserSession()
          setTokenState(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      // Try to get user from localStorage as fallback
      try {
        const storedUser = getUserSession()
        if (storedUser) {
          setUserState(storedUser)
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error)
        clearUserSession()
      } finally {
        setLoading(false)
      }
    }
  }, [])

  const setUser = useCallback((newUser: User) => {
    setUserState(newUser)
    setUserSession(newUser)
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const { user: userData, token: newToken } = await authAPI.signup(name, email, password)
    setUserState(userData)
    setTokenState(newToken)
    setUserSession(userData)
    setToken(newToken)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { user: userData, token: newToken } = await authAPI.login(email, password)
    setUserState(userData)
    setTokenState(newToken)
    setUserSession(userData)
    setToken(newToken)
  }, [])

  const loginWithGoogle = useCallback(() => {
    // Redirect to backend Google OAuth endpoint
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    window.location.href = `${API_BASE_URL}/auth/google`
  }, [])

  const logout = useCallback(() => {
    authAPI.logout().catch(console.error)
    setUserState(null)
    setTokenState(null)
    clearUserSession()
    window.location.href = "/login"
  }, [])

  const value: AuthContextType = {
    user,
    token,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
