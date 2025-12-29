"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { fileAPI } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { Download, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatFileSize, formatDate, getFileIcon } from "@/lib/utils/file"

export default function SharedFilePage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const token = params.token as string
  
  const [loading, setLoading] = useState(true)
  const [file, setFile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      loadSharedFile()
    }
  }, [token])

  const loadSharedFile = async () => {
    setLoading(true)
    setError(null)
    try {
      const fileData = await fileAPI.getSharedFileByToken(token)
      setFile(fileData)
    } catch (err: any) {
      console.error("Failed to load shared file:", err)
      setError(err.message || "Failed to load shared file")
      showToast(err.message || "Failed to load shared file", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!file || !token) return
    
    try {
      showToast(`Downloading ${file.name}...`, "info")
      // Use the share token to download instead of file ID with auth
      await fileAPI.downloadSharedFile(token, file.name || file.original_name)
      showToast(`Download started: ${file.name}`, "success")
    } catch (err: any) {
      console.error("Failed to download file:", err)
      showToast(err.message || "Failed to download file", "error")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-muted-foreground">Loading shared file...</p>
        </div>
      </div>
    )
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">🔒</div>
          <h1 className="text-2xl font-semibold text-foreground">File Not Found</h1>
          <p className="text-muted-foreground">
            {error || "This shared file is no longer available or the link is invalid."}
          </p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="ghost"
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-light text-foreground">Shared File</h1>
        </div>

        {/* File Preview Card */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <div className="flex items-start gap-6">
            {/* File Icon */}
            <div className="text-8xl flex-shrink-0">
              {getFileIcon(file.type || "file", file.name || file.original_name)}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-semibold text-foreground mb-2 truncate">
                {file.name || file.original_name}
              </h2>
              <p className="text-muted-foreground mb-4">
                {file.type === "folder" ? "Folder" : "File"}
              </p>

              {/* File Details */}
              <div className="space-y-2 mb-6">
                {file.size && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm w-24">Size:</span>
                    <span className="text-foreground">
                      {typeof file.size === "number"
                        ? formatFileSize(file.size)
                        : typeof file.size === "string" && !isNaN(parseInt(file.size))
                        ? formatFileSize(parseInt(file.size))
                        : file.size}
                    </span>
                  </div>
                )}
                {file.created_at && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm w-24">Created:</span>
                    <span className="text-foreground">{formatDate(file.created_at)}</span>
                  </div>
                )}
                {file.shared_by && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm w-24">Shared by:</span>
                    <span className="text-foreground">
                      {file.shared_by.name || file.shared_by.email || "Unknown"}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {file.type !== "folder" && (
                  <Button
                    onClick={handleDownload}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            This file was shared with you via a shareable link. You can download it if you have permission.
          </p>
        </div>
      </div>
    </div>
  )
}

