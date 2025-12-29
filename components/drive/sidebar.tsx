"use client"

import type React from "react"
import { Plus, Home, Cloud, Users, Clock, Star, AlertCircle, Trash2, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SIDEBAR_NAVIGATION, STORAGE_LIMIT, STORAGE_USED } from "@/lib/constants"
import { formatFileSize } from "@/lib/utils/file"

interface SidebarProps {
  onNewClick: () => void
  activeNav?: string
  onNavChange?: (nav: string) => void
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Home className="w-5 h-5" />,
  Cloud: <Cloud className="w-5 h-5" />,
  HardDrive: <HardDrive className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  Star: <Star className="w-5 h-5" />,
  AlertCircle: <AlertCircle className="w-5 h-5" />,
  Trash2: <Trash2 className="w-5 h-5" />,
}

export function Sidebar({ onNewClick, activeNav = "mydrive", onNavChange }: SidebarProps) {
  const storagePercentage = (STORAGE_USED / STORAGE_LIMIT) * 100

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col p-4 overflow-y-auto">
      <Button
        onClick={onNewClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full mb-6 gap-2 font-medium"
      >
        <Plus className="w-5 h-5" />
        New
      </Button>

      {/* Navigation Items */}
      <nav className="space-y-1 flex-1">
        {SIDEBAR_NAVIGATION.map((item) => (
          <NavItem 
            key={item.id} 
            icon={ICON_MAP[item.icon]} 
            label={item.label} 
            active={activeNav === item.id}
            onClick={() => onNavChange?.(item.id)}
          />
        ))}
      </nav>

      <div className="border-t border-border pt-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Storage</span>
            <span className="text-xs text-muted-foreground">{Math.round(storagePercentage)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                storagePercentage > 80 ? "bg-red-500" : storagePercentage > 60 ? "bg-orange-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            ></div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(STORAGE_USED)} of {formatFileSize(STORAGE_LIMIT)} used
        </p>
        <Button variant="outline" className="w-full border-border text-foreground hover:bg-gray-800 bg-transparent">
          Get more storage
        </Button>
      </div>
    </aside>
  )
}

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-2 rounded-lg transition-colors ${
        active ? "bg-blue-600 text-white font-medium" : "text-muted-foreground hover:bg-gray-800"
      }`}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  )
}
