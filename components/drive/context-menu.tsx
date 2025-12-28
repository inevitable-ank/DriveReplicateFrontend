"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { Share2, Download, Copy, Edit, Info, Trash2, Folder, Eye } from "lucide-react"
import type { File } from "@/lib/types"
import { CONTEXT_MENU_ACTIONS } from "@/lib/constants"

interface ContextMenuProps {
  x: number
  y: number
  file: File
  onClose: () => void
  onAction: (action: string) => void
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Eye: <Eye className="w-4 h-4" />,
  Download: <Download className="w-4 h-4" />,
  Edit: <Edit className="w-4 h-4" />,
  Copy: <Copy className="w-4 h-4" />,
  Share2: <Share2 className="w-4 h-4" />,
  Folder: <Folder className="w-4 h-4" />,
  Info: <Info className="w-4 h-4" />,
  Trash2: <Trash2 className="w-4 h-4" />,
}

export function ContextMenu({ x, y, file, onClose, onAction }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  let finalX = x
  let finalY = y

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      if (rect.right > window.innerWidth) {
        finalX = window.innerWidth - rect.width - 10
      }
      if (rect.bottom > window.innerHeight) {
        finalY = window.innerHeight - rect.height - 10
      }
    }
  }, [x, y])

  return (
    <div
      ref={menuRef}
      style={{ top: `${finalY}px`, left: `${finalX}px` }}
      className="fixed z-50 bg-card rounded-lg shadow-2xl border border-border min-w-48 py-1"
    >
      {CONTEXT_MENU_ACTIONS.map((action, index) => (
        <div key={action.id}>
          {action.id === "delete" && <div className="border-t border-border my-1" />}
          <ContextMenuItem
            icon={ICON_MAP[action.icon]}
            label={action.label}
            hasSubmenu={action.hasSubmenu}
            isDangerous={action.isDangerous}
            onClick={() => onAction(action.id)}
          />
        </div>
      ))}
    </div>
  )
}

function ContextMenuItem({
  icon,
  label,
  hasSubmenu,
  isDangerous,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  hasSubmenu?: boolean
  isDangerous?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
        isDangerous
          ? "text-destructive hover:bg-red-900/20"
          : "text-muted-foreground hover:bg-gray-800 hover:text-foreground"
      }`}
    >
      <span className="w-4 h-4">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {hasSubmenu && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  )
}
