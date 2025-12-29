"use client"

import type React from "react"

import { Search, Settings, Grid3x3, HelpCircle, LogOut, MoreVertical, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useState, useRef, useEffect } from "react"
import { FileUpload } from "./file-upload"

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onUploadComplete?: () => void
  onUploadError?: (error: string) => void
}

export function Header({ searchQuery, onSearchChange, onUploadComplete, onUploadError }: HeaderProps) {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showUserMenu])

  return (
    <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between gap-4">
      {/* Logo and Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 via-blue-500 to-red-500 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-white">G</span>
          </div>
          <span className="text-lg font-semibold text-foreground">Drive</span>
        </div>

        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search in Drive"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent outline-none text-sm placeholder-muted-foreground flex-1 text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2">
        <FileUpload onUploadComplete={onUploadComplete || (() => {})} onError={onUploadError} />
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <HelpCircle className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Grid3x3 className="w-5 h-5" />
        </Button>

        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="text-muted-foreground hover:text-foreground"
          >
            {user?.picture ? (
              <img
                src={user.picture || "/placeholder.svg"}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </Button>

          {/* User Menu Dropdown */}
          {showUserMenu && user && (
            <div className="absolute right-0 mt-2 w-72 bg-card rounded-lg shadow-xl border border-border py-2 z-50">
              <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                {user.picture ? (
                  <img
                    src={user.picture || "/placeholder.svg"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              <div className="px-4 py-2 space-y-1">
                <MenuOption icon={<Settings className="w-4 h-4" />} label="Manage Account" />
                <MenuOption icon={<MoreVertical className="w-4 h-4" />} label="Settings" />
              </div>

              <div className="border-t border-border px-4 py-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-3 px-2 py-2 text-sm text-destructive hover:bg-red-900/20 rounded transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function MenuOption({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full flex items-center gap-3 px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-gray-800 rounded transition-colors">
      {icon}
      {label}
    </button>
  )
}
