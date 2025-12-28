"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { FileGrid } from "./file-grid"
import { ContextMenu } from "./context-menu"
import { FilterBar } from "./filter-bar"
import { CreateFileDialog } from "./create-file-dialog"
import { RenameDialog } from "./rename-dialog"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import { FileInfoDialog } from "./file-info-dialog"
import type { File } from "@/lib/types"
import { getFileIcon, formatDate } from "@/lib/utils/file"

const MOCK_FILES: File[] = [
  {
    id: "1",
    name: "Project Proposal.pdf",
    type: "file",
    size: "2.5 MB",
    modifiedDate: "Jan 15, 2024",
    owner: "You",
    mimeType: "application/pdf",
    icon: "📕",
  },
  {
    id: "2",
    name: "Design Assets",
    type: "folder",
    size: "—",
    modifiedDate: "Jan 12, 2024",
    owner: "You",
    mimeType: "folder",
    icon: "📁",
  },
  {
    id: "3",
    name: "Presentation Slides.pptx",
    type: "file",
    size: "1.8 MB",
    modifiedDate: "Jan 10, 2024",
    owner: "You",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    icon: "📈",
  },
  {
    id: "4",
    name: "Budget Spreadsheet.xlsx",
    type: "file",
    size: "3.1 MB",
    modifiedDate: "Jan 8, 2024",
    owner: "You",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    icon: "📊",
  },
]

export default function DrivePage() {
  const [files, setFiles] = useState<File[]>(MOCK_FILES)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [peopleFilter, setPeopleFilter] = useState("anyone")
  const [modifiedFilter, setModifiedFilter] = useState("anytime")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [activeNav, setActiveNav] = useState("mydrive")

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileInfoDialogOpen, setFileInfoDialogOpen] = useState(false)

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter.toLowerCase() === "all" || file.type === typeFilter.toLowerCase()
    return matchesSearch && matchesType
  })

  const handleCreateFile = useCallback((name: string, type: "file" | "folder") => {
    const newFile: File = {
      id: `file-${Date.now()}`,
      name: type === "folder" ? name : name.includes(".") ? name : `${name}.txt`,
      type,
      size: type === "folder" ? "—" : "0 KB",
      modifiedDate: formatDate(new Date()),
      owner: "You",
      mimeType: type === "folder" ? "folder" : "text/plain",
      icon: getFileIcon(type, name),
    }
    setFiles((prev) => [newFile, ...prev])
  }, [])

  const handleDeleteFile = useCallback(() => {
    if (selectedFile) {
      setFiles((prev) => prev.filter((f) => f.id !== selectedFile.id))
      setContextMenu(null)
      setSelectedFile(null)
    }
  }, [selectedFile])

  const handleRenameFile = useCallback(
    (newName: string) => {
      if (selectedFile) {
        setFiles((prev) => prev.map((f) => (f.id === selectedFile.id ? { ...f, name: newName } : f)))
        setSelectedFile(null)
      }
    },
    [selectedFile],
  )

  const handleFileContextMenu = useCallback((e: React.MouseEvent, file: File) => {
    e.preventDefault()
    setSelectedFile(file)
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  const handleContextMenuAction = useCallback(
    (action: string) => {
      switch (action) {
        case "rename":
          setRenameDialogOpen(true)
          setContextMenu(null)
          break
        case "delete":
          setDeleteDialogOpen(true)
          setContextMenu(null)
          break
        case "info":
          setFileInfoDialogOpen(true)
          setContextMenu(null)
          break
        case "download":
          if (selectedFile) {
            console.log("[v0] Download initiated:", selectedFile.name)
          }
          setContextMenu(null)
          break
        case "copy":
          if (selectedFile) {
            const copyFile: File = {
              ...selectedFile,
              id: `file-${Date.now()}`,
              name: `${selectedFile.name} (copy)`,
            }
            setFiles((prev) => [...prev, copyFile])
          }
          setContextMenu(null)
          break
        case "share":
          if (selectedFile) {
            console.log("[v0] Share initiated:", selectedFile.name)
          }
          setContextMenu(null)
          break
        default:
          setContextMenu(null)
      }
    },
    [selectedFile],
  )

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar onNewClick={() => setCreateDialogOpen(true)} activeNav={activeNav} onNavChange={setActiveNav} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <div className="flex-1 overflow-auto px-6 py-4">
          {/* Header and Filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-light text-foreground">My Drive</h1>
            </div>

            <FilterBar
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              peopleFilter={peopleFilter}
              setPeopleFilter={setPeopleFilter}
              modifiedFilter={modifiedFilter}
              setModifiedFilter={setModifiedFilter}
            />
          </div>

          {/* File Grid or Empty State */}
          {filteredFiles.length > 0 ? (
            <FileGrid files={filteredFiles} onContextMenu={handleFileContextMenu} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <p className="text-muted-foreground text-lg">No files found</p>
              {searchQuery && <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>}
            </div>
          )}

          {/* Context Menu */}
          {contextMenu && selectedFile && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              file={selectedFile}
              onClose={() => setContextMenu(null)}
              onAction={handleContextMenuAction}
            />
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateFileDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onCreateFile={handleCreateFile} />

      <RenameDialog
        open={renameDialogOpen}
        currentName={selectedFile?.name || ""}
        onOpenChange={setRenameDialogOpen}
        onRename={handleRenameFile}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        fileName={selectedFile?.name || ""}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteFile}
      />

      <FileInfoDialog open={fileInfoDialogOpen} file={selectedFile} onOpenChange={setFileInfoDialogOpen} />
    </div>
  )
}
