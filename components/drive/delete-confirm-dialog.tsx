"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteConfirmDialogProps {
  open: boolean
  fileName: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteConfirmDialog({ open, fileName, onOpenChange, onConfirm }: DeleteConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Delete permanently?</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            "{fileName}" will be permanently deleted. You can't undo this action.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border text-muted-foreground">
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-destructive hover:bg-red-700 text-white">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
