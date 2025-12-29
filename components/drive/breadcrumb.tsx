"use client"

import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  id: string | null
  name: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  onItemClick: (id: string | null, index: number) => void
}

export function Breadcrumb({ items, onItemClick }: BreadcrumbProps) {
  if (items.length <= 1) return null

  return (
    <nav className="flex items-center gap-2 text-sm mb-4" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={item.id || "root"} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <button
            onClick={() => onItemClick(item.id, index)}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              index === items.length - 1
                ? "text-foreground font-medium cursor-default"
                : "text-muted-foreground hover:text-foreground hover:bg-gray-800"
            }`}
            disabled={index === items.length - 1}
          >
            {index === 0 && <Home className="w-4 h-4" />}
            <span>{item.name}</span>
          </button>
        </div>
      ))}
    </nav>
  )
}

