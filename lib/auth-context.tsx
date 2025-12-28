"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "@/lib/types"
import { setUserSession, getUserSession, clearUserSession } from "@/lib/utils/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: () => void
  logout: () => void
  isAuthenticated: boolean
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  }, [])

  const setUser = useCallback((newUser: User) => {
    setUserState(newUser)
    setUserSession(newUser)
  }, [])

  const login = useCallback(() => {
    window.location.href = "/api/auth/google"
  }, [])

  const logout = useCallback(() => {
    setUserState(null)
    clearUserSession()
    fetch("/api/auth/logout", { method: "POST" })
      .then(() => {
        window.location.href = "/login"
      })
      .catch((error) => console.error("Logout failed:", error))
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    login,
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
