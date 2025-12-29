"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { fileAPI } from "@/lib/api"
import type { File } from "@/lib/types"

interface FileViewerProps {
  open: boolean
  file: File | null
  files?: File[] // Optional: for navigation between files
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
}

export function FileViewer({ open, file, files, onClose, onNext, onPrevious }: FileViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileType, setFileType] = useState<"image" | "pdf" | "video" | "audio" | "other">("other")

  useEffect(() => {
    if (open && file) {
      loadFilePreview()
    } else {
      // Cleanup
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [open, file])

  const loadFilePreview = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      // Determine file type
      const mimeType = file.mimeType || ""
      const fileName = file.name.toLowerCase()

      if (mimeType.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName)) {
        setFileType("image")
        const url = await fileAPI.getFilePreviewUrl(file.id)
        setPreviewUrl(url)
      } else if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
        setFileType("pdf")
        const url = await fileAPI.getFilePreviewUrl(file.id)
        setPreviewUrl(url)
      } else if (mimeType.startsWith("video/") || /\.(mp4|webm|ogg|avi|mov)$/i.test(fileName)) {
        setFileType("video")
        const url = await fileAPI.getFilePreviewUrl(file.id)
        setPreviewUrl(url)
      } else if (mimeType.startsWith("audio/") || /\.(mp3|wav|ogg|flac)$/i.test(fileName)) {
        setFileType("audio")
        const url = await fileAPI.getFilePreviewUrl(file.id)
        setPreviewUrl(url)
      } else {
        setFileType("other")
        setError("Preview not available for this file type. Please download to view.")
      }
    } catch (err: any) {
      console.error("Failed to load file preview:", err)
      setError(err.message || "Failed to load file preview")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!file) return
    try {
      await fileAPI.downloadFile(file.id, file.name)
    } catch (err: any) {
      console.error("Download failed:", err)
    }
  }

  const canNavigate = files && files.length > 1 && onNext && onPrevious
  const currentIndex = file && files ? files.findIndex(f => f.id === file.id) : -1
  const hasNext = canNavigate && currentIndex < files.length - 1
  const hasPrevious = canNavigate && currentIndex > 0

  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border border-border max-w-[95vw] max-h-[95vh] p-0 flex flex-col">
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">Viewing {file.name}</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {canNavigate && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  className="p-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {files.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNext}
                  disabled={!hasNext}
                  className="p-2"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
            <h3 className="text-lg font-medium text-foreground truncate flex-1">{file.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-foreground hover:bg-gray-800"
            >
              <Download className="w-5 h-5 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-900 p-4">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-muted-foreground">Loading preview...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="text-6xl">📄</div>
              <p className="text-foreground">{error}</p>
              <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          ) : previewUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              {fileType === "image" && (
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="max-w-full max-h-full object-contain"
                  onError={() => setError("Failed to load image")}
                />
              )}
              {fileType === "pdf" && (
                <iframe
                  src={previewUrl}
                  className="w-full h-full min-h-[600px] border-0"
                  title={file.name}
                />
              )}
              {fileType === "video" && (
                <video
                  src={previewUrl}
                  controls
                  className="max-w-full max-h-full"
                  onError={() => setError("Failed to load video")}
                >
                  Your browser does not support the video tag.
                </video>
              )}
              {fileType === "audio" && (
                <div className="flex flex-col items-center gap-4 p-8">
                  <div className="text-6xl">🎵</div>
                  <audio src={previewUrl} controls className="w-full max-w-md" />
                  <p className="text-foreground">{file.name}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

