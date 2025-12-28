"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CreateFileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateFile: (name: string, type: "file" | "folder") => void
}

export function CreateFileDialog({ open, onOpenChange, onCreateFile }: CreateFileDialogProps) {
  const [fileName, setFileName] = useState("")
  const [fileType, setFileType] = useState<"file" | "folder">("file")

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFileName("")
      setFileType("file")
    }
    onOpenChange(isOpen)
  }

  const handleCreate = () => {
    if (fileName.trim()) {
      onCreateFile(fileName, fileType)
      setFileName("")
      onOpenChange(false)
    }
  }

  return (
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
                File Name
              </Label>
              <Input
                id="file-name"
                placeholder="Enter file name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-foreground placeholder-muted-foreground"
                onKeyPress={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
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
          <Button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!fileName.trim()}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
