"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload } from "lucide-react"
import { fileAPI } from "@/lib/api"

interface CreateFileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateFile: (name: string, type: "file" | "folder") => void
  onUploadComplete?: () => void
  onError?: (error: string) => void
}

export function CreateFileDialog({ open, onOpenChange, onCreateFile, onUploadComplete, onError }: CreateFileDialogProps) {
  const [fileName, setFileName] = useState("")
  const [fileType, setFileType] = useState<"file" | "folder">("file")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFileName("")
      setFileType("file")
    }
    onOpenChange(isOpen)
  }

  const handleCreate = () => {
    if (fileType === "file") {
      // For files, open file picker
      fileInputRef.current?.click()
    } else {
      // For folders, show message that it's not available
      if (fileName.trim()) {
        onCreateFile(fileName, fileType)
        setFileName("")
        onOpenChange(false)
      }
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setUploading(true)
      
      try {
        // Upload file with custom name if provided
        await fileAPI.uploadFile(file, fileName.trim() || undefined)
        
        // Call onCreateFile callback for consistency
        onCreateFile(fileName.trim() || file.name, "file")
        
        setFileName("")
        onOpenChange(false)
        
        // Notify parent component
        if (onUploadComplete) {
          onUploadComplete()
        }
      } catch (err: any) {
        console.error("Failed to upload file:", err)
        const errorMsg = err.message || "Failed to upload file"
        if (onError) {
          onError(errorMsg)
        }
      } finally {
        setUploading(false)
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple={false}
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Select file to upload"
      />
      
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create New</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger
                value="file"
                onClick={() => setFileType("file")}
                className="data-[state=active]:bg-blue-600 text-muted-foreground data-[state=active]:text-white"
              >
                File
              </TabsTrigger>
              <TabsTrigger
                value="folder"
                onClick={() => setFileType("folder")}
                className="data-[state=active]:bg-blue-600 text-muted-foreground data-[state=active]:text-white"
              >
                Folder
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="file-name" className="text-muted-foreground">
                  Custom Name (Optional)
                </Label>
                <Input
                  id="file-name"
                  placeholder="Leave empty to use original filename"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-foreground placeholder-muted-foreground"
                  onKeyPress={(e) => e.key === "Enter" && handleCreate()}
                />
                <p className="text-xs text-muted-foreground">
                  Click "Upload File" to select a file from your computer
                </p>
              </div>
            </TabsContent>

          <TabsContent value="folder" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name" className="text-muted-foreground">
                Folder Name
              </Label>
              <Input
                id="folder-name"
                placeholder="Enter folder name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-foreground placeholder-muted-foreground"
                onKeyPress={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter a name for your new folder
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="border-border text-muted-foreground"
          >
            Cancel
          </Button>
          {fileType === "file" ? (
            <Button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload File
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!fileName.trim()}
            >
              Create
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
