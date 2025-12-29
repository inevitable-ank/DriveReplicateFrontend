"use client"

import { useCallback, useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { fileAPI } from "@/lib/api"

interface FileUploadProps {
  onUploadComplete: () => void
  onError?: (error: string) => void
  currentFolderId?: string | null
}

export function FileUpload({ onUploadComplete, onError, currentFolderId }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      setUploading(true)

      try {
        // Check if this is a folder upload (has webkitRelativePath)
        const isFolderUpload = fileArray.some(file => (file as any).webkitRelativePath)
        
        if (isFolderUpload) {
          // Handle folder upload with structure preservation
          await uploadFolderWithStructure(fileArray)
        } else {
          // Handle regular file upload
          for (const file of fileArray) {
            try {
              await fileAPI.uploadFile(file, undefined, currentFolderId || undefined)
              setUploadProgress((prev) => ({
                ...prev,
                [file.name]: 100,
              }))
            } catch (err: any) {
              console.error(`Failed to upload ${file.name}:`, err)
              if (onError) {
                onError(`Failed to upload ${file.name}: ${err.message}`)
              }
            }
          }
        }

        // Clear progress after a short delay
        setTimeout(() => {
          setUploadProgress({})
          setUploading(false)
          onUploadComplete()
        }, 500)
      } catch (err: any) {
        console.error("Upload error:", err)
        setUploading(false)
        if (onError) {
          onError(err.message || "Failed to upload files")
        }
      }
    },
    [onUploadComplete, onError],
  )

  const uploadFolderWithStructure = async (files: File[]) => {
    // Create a map to store folder IDs by path
    const folderMap = new Map<string, string>() // path -> folderId
    folderMap.set("", null as any) // Root folder

    // Sort files by path depth to create folders first
    const filesWithPath = files.map(file => ({
      file,
      path: (file as any).webkitRelativePath || file.name,
      parts: ((file as any).webkitRelativePath || file.name).split("/"),
    })).sort((a, b) => a.parts.length - b.parts.length)

    // Upload files in order, creating folders as needed
    for (const { file, path, parts } of filesWithPath) {
      const fileName = parts[parts.length - 1]
      const folderPath = parts.slice(0, -1).join("/")
      
      // Get or create parent folder ID
      let parentId = folderMap.get(folderPath) || null
      
      // If we need a parent folder and don't have it, create it
      if (folderPath && !folderMap.has(folderPath)) {
        // Create all parent folders in the path
        const pathParts = folderPath.split("/")
        let currentPath = ""
        
        for (let i = 0; i < pathParts.length; i++) {
          const folderName = pathParts[i]
          currentPath = i === 0 ? folderName : `${currentPath}/${folderName}`
          const parentPath = i === 0 ? "" : pathParts.slice(0, i).join("/")
          const parentFolderId = folderMap.get(parentPath) || null
          
          if (!folderMap.has(currentPath)) {
            try {
              const folder = await fileAPI.createFolder(folderName, parentFolderId ?? undefined)
              folderMap.set(currentPath, folder.id)
              setUploadProgress((prev) => ({
                ...prev,
                [`📁 ${folderName}`]: 100,
              }))
            } catch (err: any) {
              console.error(`Failed to create folder ${folderName}:`, err)
              // Continue anyway - might already exist
            }
          }
        }
        
        parentId = folderMap.get(folderPath) || null
      }

      // Upload the file with parent folder
      try {
        await fileAPI.uploadFile(file, fileName, parentId)
        setUploadProgress((prev) => ({
          ...prev,
          [path]: 100,
        }))
      } catch (err: any) {
        console.error(`Failed to upload ${path}:`, err)
        if (onError) {
          onError(`Failed to upload ${path}: ${err.message}`)
        }
      }
    }
  }

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFileUpload(files)
      }
    },
    [handleFileUpload],
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFileUpload(files)
      }
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [handleFileUpload],
  )

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const folderInputRef = useRef<HTMLInputElement>(null)

  const handleFolderClick = useCallback(() => {
    folderInputRef.current?.click()
  }, [])

  const handleFolderInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFileUpload(files)
      }
      // Reset input so same folder can be selected again
      if (folderInputRef.current) {
        folderInputRef.current.value = ""
      }
    },
    [handleFileUpload],
  )

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Upload files"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        {...({ webkitdirectory: "", directory: "" } as any)}
        onChange={handleFolderInputChange}
        className="hidden"
        aria-label="Upload folder"
      />

      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div
          className="fixed inset-0 z-50 bg-blue-600/20 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-blue-500"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bg-card border border-border rounded-lg p-8 shadow-xl text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <p className="text-xl font-semibold text-foreground mb-2">Drop files to upload</p>
            <p className="text-sm text-muted-foreground">Release to upload your files</p>
          </div>
        </div>
      )}

      {/* Upload Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleClick}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          aria-label="Upload files"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </>
          )}
        </button>
        <button
          onClick={handleFolderClick}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          aria-label="Upload folder"
          title="Upload a folder with all its contents"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Folder</span>
        </button>
      </div>

      {/* Upload Progress (optional - can be shown in a toast or progress bar) */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 shadow-xl z-50 min-w-[300px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Uploading files...</span>
            <button
              onClick={() => {
                setUploadProgress({})
                setUploading(false)
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName}>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span className="truncate flex-1 mr-2">{fileName}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// Invisible drag & drop zone wrapper
export function FileUploadZone({ children, onUploadComplete, onError, currentFolderId }: FileUploadProps & { children: React.ReactNode }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        // Check if this is a folder drop (has webkitRelativePath)
        const fileArray = Array.from(files)
        const isFolderUpload = fileArray.some(file => (file as any).webkitRelativePath)
        
        if (isFolderUpload) {
          // Use the same folder upload logic
          // Note: This requires the uploadFolderWithStructure function to be accessible
          // For now, we'll handle it in the FileUpload component
          console.log("Folder drop detected - please use the Upload Folder button for folder uploads")
          if (onError) {
            onError("Please use the 'Upload Folder' button to upload folders with structure")
          }
        } else {
          // Regular file upload
          try {
            for (const file of fileArray) {
              await fileAPI.uploadFile(file, undefined, currentFolderId || undefined)
            }
            onUploadComplete()
          } catch (err: any) {
            console.error("Upload error:", err)
            if (onError) {
              onError(err.message || "Failed to upload files")
            }
          }
        }
      }
    },
    [onUploadComplete, onError],
  )

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={isDragging ? "relative" : ""}
    >
      {isDragging && (
        <div className="absolute inset-0 z-40 bg-blue-600/10 border-4 border-dashed border-blue-500 rounded-lg flex items-center justify-center pointer-events-none">
          <div className="bg-card border border-border rounded-lg p-6 shadow-xl">
            <p className="text-lg font-semibold text-foreground">Drop files to upload</p>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

