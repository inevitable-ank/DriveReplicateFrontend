"use client"

import { useCallback, useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { fileAPI } from "@/lib/api"

interface FileUploadProps {
  onUploadComplete: () => void
  onError?: (error: string) => void
}

export function FileUpload({ onUploadComplete, onError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      setUploading(true)

      try {
        // Upload files sequentially to avoid overwhelming the server
        for (const file of fileArray) {
          try {
            await fileAPI.uploadFile(file)
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

      {/* Upload Button */}
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
export function FileUploadZone({ children, onUploadComplete, onError }: FileUploadProps & { children: React.ReactNode }) {
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
        try {
          for (const file of Array.from(files)) {
            await fileAPI.uploadFile(file)
          }
          onUploadComplete()
        } catch (err: any) {
          console.error("Upload error:", err)
          if (onError) {
            onError(err.message || "Failed to upload files")
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

