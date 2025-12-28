"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push("/dashboard")
    return null
  }

  const handleGoogleLogin = () => {
    setIsLoading(true)
    login()
  }

  const handleDemoLogin = () => {
    // Demo login for testing without Google OAuth setup
    const demoUser = {
      id: "demo-user",
      email: "demo@example.com",
      name: "Demo User",
      picture: "https://via.placeholder.com/40",
    }
    localStorage.setItem("user", JSON.stringify(demoUser))
    router.push("/dashboard")
  }

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 flex-col items-center justify-center gap-8 px-8 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold">Google Drive Clone</h1>
        </div>
        <p className="max-w-sm text-center text-xl text-gray-400">Secure file management and storage in the cloud</p>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full flex-col items-center justify-center gap-8 px-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold">Welcome Back</h2>
            <p className="text-gray-400">Sign in to your Google Drive account</p>
          </div>

          <div className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 transition-colors hover:border-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 transition-colors hover:border-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <p className="text-xs text-gray-500">Demo: Use any email/password to test with demo user</p>
          </div>

          <div className="space-y-3">
            {/* Google OAuth Button */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-600 bg-white py-2 px-4 font-medium text-black transition-colors hover:bg-gray-100 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </Button>

            {/* Demo Login Button */}
            <Button
              onClick={handleDemoLogin}
              className="w-full rounded-lg bg-blue-600 py-2 px-4 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Demo Login
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#1a1a1a] px-2 text-gray-400">or continue with email</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400">
            No account?{" "}
            <Link href="/signup" className="font-medium text-blue-500 hover:text-blue-400">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
