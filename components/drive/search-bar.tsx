"use client"

import { Search } from "lucide-react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2">
      <Search className="w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search files..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none text-sm placeholder-gray-400 flex-1"
      />
    </div>
  )
}
