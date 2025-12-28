export const STORAGE_LIMIT = 15 * 1024 * 1024 * 1024 // 15GB in bytes
export const STORAGE_USED = 14.12 * 1024 * 1024 * 1024 // 14.12GB in bytes

export const FILE_ICONS: Record<string, string> = {
  folder: "📁",
  pdf: "📕",
  image: "🖼️",
  video: "🎬",
  audio: "🎵",
  document: "📄",
  spreadsheet: "📊",
  presentation: "📈",
  code: "💻",
  archive: "📦",
  default: "📄",
}

export const SIDEBAR_NAVIGATION = [
  { id: "home", label: "Home", icon: "Home" },
  { id: "mydrive", label: "MyDrive", icon: "Cloud" },
  { id: "computers", label: "Computers", icon: "HardDrive" },
  { id: "shared", label: "Shared with me", icon: "Users" },
  { id: "recent", label: "Recent", icon: "Clock" },
  { id: "starred", label: "Starred", icon: "Star" },
  { id: "spam", label: "Spam", icon: "AlertCircle" },
  { id: "trash", label: "Trash", icon: "Trash2" },
]

export const CONTEXT_MENU_ACTIONS = [
  { id: "open", label: "Open with", icon: "Eye", hasSubmenu: true },
  { id: "download", label: "Download", icon: "Download" },
  { id: "rename", label: "Rename", icon: "Edit" },
  { id: "copy", label: "Make a copy", icon: "Copy" },
  { id: "share", label: "Share", icon: "Share2", hasSubmenu: true },
  { id: "organize", label: "Organize", icon: "Folder", hasSubmenu: true },
  { id: "info", label: "File information", icon: "Info", hasSubmenu: true },
  { id: "delete", label: "Move to trash", icon: "Trash2", isDangerous: true },
]
