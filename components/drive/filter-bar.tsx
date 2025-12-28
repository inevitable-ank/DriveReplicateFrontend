"use client"

import { ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface FilterBarProps {
  typeFilter: string
  setTypeFilter: (value: string) => void
  peopleFilter: string
  setPeopleFilter: (value: string) => void
  modifiedFilter: string
  setModifiedFilter: (value: string) => void
}

const FILTER_OPTIONS = {
  type: ["All", "Document", "Spreadsheet", "Presentation", "Folder", "PDF", "Image", "Video"],
  people: ["Anyone", "Shared with me", "My files"],
  modified: ["Anytime", "Today", "Last week", "Last month", "Last year"],
}

export function FilterBar({
  typeFilter,
  setTypeFilter,
  peopleFilter,
  setPeopleFilter,
  modifiedFilter,
  setModifiedFilter,
}: FilterBarProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <FilterDropdown label="Type" value={typeFilter} onChange={setTypeFilter} options={FILTER_OPTIONS.type} />
      <FilterDropdown label="People" value={peopleFilter} onChange={setPeopleFilter} options={FILTER_OPTIONS.people} />
      <FilterDropdown
        label="Modified"
        value={modifiedFilter}
        onChange={setModifiedFilter}
        options={FILTER_OPTIONS.modified}
      />
    </div>
  )
}

function FilterDropdown({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const displayValue = value.charAt(0).toUpperCase() + value.slice(1)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-gray-800 transition-colors flex items-center gap-2"
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-card rounded-lg border border-border shadow-lg z-40 py-1">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option.toLowerCase())
                setIsOpen(false)
              }}
              className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                option.toLowerCase() === value ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-gray-800"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
