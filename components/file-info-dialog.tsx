"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Download, Share2 } from "lucide-react"
import type { File } from "@/lib/types"

interface FileInfoDialogProps {
  open: boolean
  file: File | null
  onOpenChange: (open: boolean) => void
}

export function FileInfoDialog({ open, file, onOpenChange }: FileInfoDialogProps) {
  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">File Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Preview and Name */}
          <div className="flex items-start gap-4 pb-4 border-b border-border">
            <div className="text-6xl flex-shrink-0">{file.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-foreground font-medium truncate">{file.name}</h3>
              <p className="text-muted-foreground text-sm">{file.type === "file" ? "File" : "Folder"}</p>
            </div>
          </div>

          {/* File Details */}
          <div className="space-y-3">
            <DetailRow label="Size" value={file.size} />
            <DetailRow label="Modified" value={file.modifiedDate} />
            <DetailRow label="Owner" value={file.owner} />
            {file.description && <DetailRow label="Description" value={file.description} />}
          </div>

          <div className="flex gap-2 pt-4 border-t border-border">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white gap-2">
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-foreground break-words">{value}</p>
    </div>
  )
}
