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
import { FileUploadZone } from "./file-upload"
import { useToast } from "@/components/ui/toast"

export default function DrivePage() {
  const { showToast } = useToast()
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
      let fetchedFiles: any[] = []
      
      // Use search endpoint if there's a search query, otherwise use regular getFiles
      if (searchQuery.trim()) {
        fetchedFiles = await fileAPI.searchFiles(searchQuery.trim())
      } else {
        fetchedFiles = await fileAPI.getFiles(100, 0)
      }
      
      // Transform backend response to match frontend File type
      // Backend returns: id, name, original_name, size, mime_type, created_at
      // Note: 'name' is the current/renamed name, 'original_name' is the original filename
      const transformedFiles: File[] = fetchedFiles.map((file: any) => {
        // Determine if it's a folder (backend might not have type field, check mime_type)
        const isFolder = file.mime_type === "folder" || file.type === "folder"
        // Use 'name' as display name since it's updated when renamed
        // 'original_name' is just metadata about the original filename
        const displayName = file.name || file.original_name
        
        return {
          id: file.id || file._id,
          name: displayName,
          type: isFolder ? "folder" : "file",
          size: typeof file.size === "number" 
            ? formatFileSize(file.size) 
            : (isFolder ? "—" : file.size || "0 KB"),
          modifiedDate: file.created_at ? formatDate(new Date(file.created_at)) : formatDate(new Date()),
          owner: file.owner?.name || "You",
          mimeType: file.mime_type || (isFolder ? "folder" : "application/octet-stream"),
          icon: getFileIcon(isFolder ? "folder" : "file", displayName),
          description: file.description,
        }
      })
      
      // Apply type filter client-side if needed (backend doesn't support it)
      const filteredByType = typeFilter === "all" 
        ? transformedFiles 
        : transformedFiles.filter(f => f.type === typeFilter.toLowerCase())
      
      setFiles(filteredByType)
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

  // Files are already filtered by backend (search) and client-side (type)
  const filteredFiles = files

  const handleCreateFile = useCallback(async (name: string, type: "file" | "folder") => {
    try {
      if (type === "folder") {
        // Backend doesn't have folder creation endpoint, so we'll skip for now
        // TODO: Implement folder creation if backend adds it
        console.warn("Folder creation not yet implemented in backend")
        setError("Folder creation is not yet available")
      } else {
        // For file creation, the file picker is handled in CreateFileDialog
        // This function receives the file name and type, but actual file selection
        // happens in the dialog component. We just need to refresh the list.
        // The actual upload is handled by the dialog's file input handler.
        await fetchFiles()
      }
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
              // Show toast notification when download starts
              showToast(`Download started: ${selectedFile.name}`, "success", 3000)
              await fileAPI.downloadFile(selectedFile.id, selectedFile.name)
            } catch (err: any) {
              console.error("Failed to download file:", err)
              showToast(`Download failed: ${err.message || "Unknown error"}`, "error", 4000)
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
    <FileUploadZone onUploadComplete={fetchFiles} onError={setError}>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar onNewClick={() => setCreateDialogOpen(true)} activeNav={activeNav} onNavChange={setActiveNav} />

        <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery}
          onUploadComplete={fetchFiles}
          onUploadError={setError}
        />

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
      <CreateFileDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
        onCreateFile={handleCreateFile}
        onUploadComplete={fetchFiles}
        onError={setError}
      />

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
    </FileUploadZone>
  )
}
