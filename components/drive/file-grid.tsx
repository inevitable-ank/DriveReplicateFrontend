"use client"

import type React from "react"
import type { File } from "@/lib/types"
import { MoreVertical } from "lucide-react"

interface FileGridProps {
  files: File[]
  onContextMenu: (e: React.MouseEvent, file: File) => void
  onFileClick?: (file: File) => void
}

export function FileGrid({ files, onContextMenu, onFileClick }: FileGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <FileCard 
          key={file.id} 
          file={file} 
          onContextMenu={onContextMenu}
          onClick={onFileClick}
        />
      ))}
    </div>
  )
}

function FileCard({ 
  file, 
  onContextMenu,
  onClick
}: { 
  file: File
  onContextMenu: (e: React.MouseEvent, file: File) => void
  onClick?: (file: File) => void
}) {
  const handleClick = (e: React.MouseEvent) => {
    // Don't open if right-click or if clicking the more options button
    if (e.button === 2 || (e.target as HTMLElement).closest('button')) {
      return
    }
    
    // Always call onClick - let the parent handle folder vs file logic
    if (onClick) {
      onClick(file)
    }
  }

  return (
    <div
      onContextMenu={(e) => onContextMenu(e, file)}
      onClick={handleClick}
      className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors cursor-pointer group"
    >
      <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center relative overflow-hidden">
        <span className="text-6xl">{file.icon}</span>

        {/* More options button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onContextMenu(e, file)
          }}
          className="absolute top-2 right-2 p-2 rounded-full bg-gray-900/80 opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-800"
        >
          <MoreVertical className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* File Info */}
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-medium text-foreground truncate line-clamp-2" title={file.name}>
          {file.name}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{file.modifiedDate}</p>
        </div>
      </div>
    </div>
  )
}
