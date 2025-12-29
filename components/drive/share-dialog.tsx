"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, X, Mail, Link2, UserMinus } from "lucide-react"
import { fileAPI } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import type { File } from "@/lib/types"

interface ShareDialogProps {
  open: boolean
  file: File | null
  onOpenChange: (open: boolean) => void
  onShareComplete?: () => void
}

interface SharedUser {
  user_id: string
  email: string
  name?: string
  permission: "view" | "edit"
  shared_at?: string
}

interface ShareLink {
  enabled: boolean
  link?: string
  token?: string
  permission?: "view" | "edit"
}

export function ShareDialog({ open, file, onOpenChange, onShareComplete }: ShareDialogProps) {
  const { showToast } = useToast()
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState<"view" | "edit">("view")
  const [loading, setLoading] = useState(false)
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([])
  const [shareLink, setShareLink] = useState<ShareLink | null>(null)
  const [loadingShareInfo, setLoadingShareInfo] = useState(false)

  // Load share information when dialog opens
  useEffect(() => {
    if (open && file) {
      loadShareInfo()
    } else {
      // Reset form when dialog closes
      setEmail("")
      setPermission("view")
      setSharedUsers([])
      setShareLink(null)
    }
  }, [open, file])

  const loadShareInfo = async () => {
    if (!file) return
    
    setLoadingShareInfo(true)
    try {
      const shareInfo = await fileAPI.getShareInfo(file.id)
      setSharedUsers(shareInfo.shared_with || [])
      
      // Transform backend response to match frontend structure
      if (shareInfo.share_link) {
        const backendLink = shareInfo.share_link
        setShareLink({
          enabled: backendLink.enabled || !!backendLink.share_link,
          link: backendLink.share_link || backendLink.link,
          token: backendLink.token,
          permission: backendLink.permission,
        })
      } else {
        setShareLink(null)
      }
    } catch (err: any) {
      console.error("Failed to load share info:", err)
      // Don't show error toast, just silently fail
    } finally {
      setLoadingShareInfo(false)
    }
  }

  const handleShareWithUser = async () => {
    if (!file || !email.trim()) {
      showToast("Please enter an email address", "error")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      showToast("Please enter a valid email address", "error")
      return
    }

    setLoading(true)
    try {
      await fileAPI.shareFile(file.id, email.trim(), permission)
      showToast(`File shared with ${email}`, "success")
      setEmail("")
      await loadShareInfo()
      if (onShareComplete) {
        onShareComplete()
      }
    } catch (err: any) {
      console.error("Failed to share file:", err)
      showToast(err.message || "Failed to share file", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateShareLink = async () => {
    if (!file) return

    setLoading(true)
    try {
      const linkData = await fileAPI.createShareLink(file.id, permission)
      // Set the share link with the returned data
      setShareLink({
        enabled: true,
        link: linkData.link || linkData.share_link,
        token: linkData.token,
        permission: linkData.permission as "view" | "edit",
      })
      showToast("Share link created", "success")
      // Reload share info to get the latest state
      await loadShareInfo()
    } catch (err: any) {
      console.error("Failed to create share link:", err)
      showToast(err.message || "Failed to create share link", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareLink?.link) return

    try {
      await navigator.clipboard.writeText(shareLink.link)
      showToast("Link copied to clipboard", "success")
    } catch (err) {
      console.error("Failed to copy link:", err)
      showToast("Failed to copy link", "error")
    }
  }

  const handleRemoveShare = async (userId: string, userEmail: string) => {
    if (!file) return

    if (!confirm(`Remove access for ${userEmail}?`)) {
      return
    }

    setLoading(true)
    try {
      await fileAPI.revokeShareAccess(file.id, userId)
      showToast("Access removed", "success")
      await loadShareInfo()
    } catch (err: any) {
      console.error("Failed to remove share:", err)
      showToast(err.message || "Failed to remove access", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveShareLink = async () => {
    if (!file) return

    setLoading(true)
    try {
      await fileAPI.removeShareLink(file.id)
      setShareLink(null)
      showToast("Share link removed", "success")
    } catch (err: any) {
      console.error("Failed to remove share link:", err)
      showToast(err.message || "Failed to remove share link", "error")
    } finally {
      setLoading(false)
    }
  }

  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Share "{file.name}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share with User Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="share-email" className="text-muted-foreground mb-2 block">
                Share with
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="share-email"
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleShareWithUser()}
                    className="bg-gray-700 border-gray-600 text-foreground placeholder-muted-foreground"
                    disabled={loading}
                  />
                </div>
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value as "view" | "edit")}
                  className="bg-gray-700 border border-gray-600 text-foreground rounded-lg px-3 py-2"
                  disabled={loading}
                >
                  <option value="view">Can view</option>
                  <option value="edit">Can edit</option>
                </select>
                <Button
                  onClick={handleShareWithUser}
                  disabled={loading || !email.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 The recipient must be a registered user. They'll see this file in their "Shared with me" section when they log in.
              </p>
            </div>

            {/* Shared Users List */}
            {loadingShareInfo ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : sharedUsers.length > 0 ? (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Shared with</Label>
                <div className="space-y-2 border border-border rounded-lg p-2 bg-gray-800/50">
                  {sharedUsers.map((user) => (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between p-2 hover:bg-gray-700 rounded transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm font-medium truncate">
                          {user.name || user.email}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {user.email} • {user.permission === "edit" ? "Can edit" : "Can view"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveShare(user.user_id, user.email)}
                        className="p-1 hover:bg-red-900/20 rounded transition-colors"
                        disabled={loading}
                        aria-label={`Remove access for ${user.email}`}
                      >
                        <UserMinus className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No one has access to this file yet
              </div>
            )}
          </div>

          {/* Share Link Section */}
          <div className="border-t border-border pt-4 space-y-4">
            <div>
              <Label className="text-muted-foreground mb-2 block">Get link</Label>
              {shareLink?.enabled && shareLink?.link ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={shareLink.link}
                      readOnly
                      className="bg-gray-700 border-gray-600 text-foreground flex-1"
                    />
                    <Button
                      onClick={handleCopyLink}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={handleRemoveShareLink}
                      variant="outline"
                      className="border-border text-muted-foreground hover:text-foreground"
                      disabled={loading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Anyone with the link can {shareLink.permission === "edit" ? "edit" : "view"} this file
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={handleCreateShareLink}
                    disabled={loading}
                    className="bg-gray-700 hover:bg-gray-600 text-foreground"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Create link
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Create a shareable link for this file
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-muted-foreground"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

