"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RenameDialogProps {
  open: boolean
  currentName: string
  onOpenChange: (open: boolean) => void
  onRename: (newName: string) => void
}

export function RenameDialog({ open, currentName, onOpenChange, onRename }: RenameDialogProps) {
  const [newName, setNewName] = useState(currentName)

  useEffect(() => {
    setNewName(currentName)
  }, [currentName, open])

  const handleRename = () => {
    if (newName.trim() && newName !== currentName) {
      onRename(newName)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Rename</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rename-input" className="text-muted-foreground">
              New Name
            </Label>
            <Input
              id="rename-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-gray-700 border-gray-600 text-foreground placeholder-muted-foreground"
              autoFocus
              onKeyPress={(e) => e.key === "Enter" && handleRename()}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border text-muted-foreground">
            Cancel
          </Button>
          <Button
            onClick={handleRename}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!newName.trim() || newName === currentName}
          >
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
