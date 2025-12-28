"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { authAPI } from "@/lib/api"
import { setToken, setUserSession } from "@/lib/utils/auth"

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code or token from URL params
        const code = searchParams.get("code")
        const token = searchParams.get("token")
        const errorParam = searchParams.get("error")

        // Handle OAuth error
        if (errorParam) {
          setError(`OAuth error: ${errorParam}`)
          setTimeout(() => router.push("/login"), 3000)
          return
        }

        // If token is provided directly (backend redirects with token)
        if (token) {
          // Store token and get user info
          setToken(token)
          const userData = await authAPI.getCurrentUser()
          setUser(userData)
          setUserSession(userData)
          router.push("/dashboard")
          return
        }

        // If code is provided (OAuth code flow)
        if (code) {
          const { user: userData, token: newToken } = await authAPI.handleGoogleCallback(code)
          setUser(userData)
          setToken(newToken)
          setUserSession(userData)
          router.push("/dashboard")
          return
        }

        // No code or token - redirect to login
        setError("No authorization code or token received")
        setTimeout(() => router.push("/login"), 3000)
      } catch (err: any) {
        console.error("OAuth callback error:", err)
        setError(err.message || "Authentication failed")
        setTimeout(() => router.push("/login"), 3000)
      }
    }

    handleCallback()
  }, [searchParams, router, setUser])

  return (
    <div className="flex h-screen items-center justify-center bg-[#1a1a1a] text-white">
      <div className="flex flex-col items-center gap-4">
        {error ? (
          <>
            <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-red-400 font-medium">{error}</p>
            <p className="text-sm text-gray-400">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500"></div>
            <p className="text-gray-300 font-medium">Completing authentication...</p>
            <p className="text-sm text-gray-500">Please wait</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#1a1a1a] text-white">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500"></div>
            <p className="text-gray-300 font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}

