import { FILE_ICONS } from "@/lib/constants"

export const getFileIcon = (type: string, name?: string): string => {
  if (type === "folder") return FILE_ICONS.folder

  if (!name) return FILE_ICONS.default

  const ext = name.split(".").pop()?.toLowerCase() || ""

  const iconMap: Record<string, string> = {
    pdf: FILE_ICONS.pdf,
    jpg: FILE_ICONS.image,
    jpeg: FILE_ICONS.image,
    png: FILE_ICONS.image,
    gif: FILE_ICONS.image,
    mp4: FILE_ICONS.video,
    avi: FILE_ICONS.video,
    mov: FILE_ICONS.video,
    mp3: FILE_ICONS.audio,
    wav: FILE_ICONS.audio,
    flac: FILE_ICONS.audio,
    doc: FILE_ICONS.document,
    docx: FILE_ICONS.document,
    txt: FILE_ICONS.document,
    xls: FILE_ICONS.spreadsheet,
    xlsx: FILE_ICONS.spreadsheet,
    csv: FILE_ICONS.spreadsheet,
    ppt: FILE_ICONS.presentation,
    pptx: FILE_ICONS.presentation,
    js: FILE_ICONS.code,
    ts: FILE_ICONS.code,
    jsx: FILE_ICONS.code,
    tsx: FILE_ICONS.code,
    py: FILE_ICONS.code,
    zip: FILE_ICONS.archive,
    rar: FILE_ICONS.archive,
  }

  return iconMap[ext] || FILE_ICONS.default
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 KB"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

export const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}
