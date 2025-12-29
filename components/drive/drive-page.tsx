"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
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
import { getFileIcon, formatDate, formatFileSize } from "@/lib/utils/file"
import { fileAPI } from "@/lib/api"

export default function DrivePage() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  // Fetch files from API
  const fetchFiles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedFiles = await fileAPI.getFiles({
        search: searchQuery || undefined,
        type: typeFilter === "all" ? undefined : typeFilter as "file" | "folder",
      })
      
      // Transform backend response to match frontend File type
      const transformedFiles: File[] = fetchedFiles.map((file: any) => ({
        id: file.id || file._id,
        name: file.name,
        type: file.type,
        size: typeof file.size === "number" 
          ? formatFileSize(file.size) 
          : file.size || (file.type === "folder" ? "—" : "0 KB"),
        modifiedDate: file.modifiedDate || file.updatedAt || formatDate(new Date(file.createdAt)),
        owner: file.owner?.name || "You",
        mimeType: file.mimeType || (file.type === "folder" ? "folder" : "application/octet-stream"),
        icon: getFileIcon(file.type, file.name),
        description: file.description,
      }))
      
      setFiles(transformedFiles)
    } catch (err: any) {
      console.error("Failed to fetch files:", err)
      setError(err.message || "Failed to load files")
      setFiles([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, typeFilter])

  // Fetch files on mount and when filters change
  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  // Client-side filtering (as fallback, backend should handle search)
  const filteredFiles = files.filter((file) => {
    const matchesSearch = !searchQuery || file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || file.type === typeFilter.toLowerCase()
    return matchesSearch && matchesType
  })

  const handleCreateFile = useCallback(async (name: string, type: "file" | "folder") => {
    try {
      if (type === "folder") {
        await fileAPI.createFolder(name)
      } else {
        // For file creation, you might want to show a file picker instead
        // For now, we'll just refresh the list
        console.warn("File creation via dialog not implemented. Use file upload instead.")
      }
      // Refresh file list
      await fetchFiles()
    } catch (err: any) {
      console.error("Failed to create file/folder:", err)
      setError(err.message || "Failed to create file/folder")
    }
  }, [fetchFiles])

  const handleDeleteFile = useCallback(async () => {
    if (!selectedFile) return
    
    try {
      await fileAPI.deleteFile(selectedFile.id)
      // Refresh file list
      await fetchFiles()
      setContextMenu(null)
      setSelectedFile(null)
    } catch (err: any) {
      console.error("Failed to delete file:", err)
      setError(err.message || "Failed to delete file")
    }
  }, [selectedFile, fetchFiles])

  const handleRenameFile = useCallback(
    async (newName: string) => {
      if (!selectedFile) return
      
      try {
        await fileAPI.renameFile(selectedFile.id, newName)
        // Refresh file list
        await fetchFiles()
        setSelectedFile(null)
      } catch (err: any) {
        console.error("Failed to rename file:", err)
        setError(err.message || "Failed to rename file")
      }
    },
    [selectedFile, fetchFiles],
  )

  const handleFileContextMenu = useCallback((e: React.MouseEvent, file: File) => {
    e.preventDefault()
    setSelectedFile(file)
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  const handleContextMenuAction = useCallback(
    async (action: string) => {
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
          if (selectedFile && selectedFile.type === "file") {
            try {
              await fileAPI.downloadFile(selectedFile.id, selectedFile.name)
            } catch (err: any) {
              console.error("Failed to download file:", err)
              setError(err.message || "Failed to download file")
            }
          }
          setContextMenu(null)
          break
        case "copy":
          if (selectedFile) {
            // TODO: Implement copy functionality via API
            console.log("Copy functionality not yet implemented")
          }
          setContextMenu(null)
          break
        case "share":
          if (selectedFile) {
            // TODO: Implement share functionality via API
            console.log("Share functionality not yet implemented")
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

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-muted-foreground">Loading files...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <p className="text-red-500 text-lg">Error: {error}</p>
              <button
                onClick={() => fetchFiles()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* File Grid or Empty State */}
          {!loading && !error && (
            filteredFiles.length > 0 ? (
              <FileGrid files={filteredFiles} onContextMenu={handleFileContextMenu} />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <p className="text-muted-foreground text-lg">No files found</p>
                {searchQuery && <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>}
              </div>
            )
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
