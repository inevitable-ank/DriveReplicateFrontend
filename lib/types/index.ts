export interface User {
    id: string
    email: string
    name: string
    picture?: string | null
    provider?: string
  }
  
  export interface File {
    id: string
    name: string
    type: "file" | "folder"
    size: string
    modifiedDate: string
    owner: string
    mimeType: string
    icon: string
    description?: string
  }
  
  export interface DialogState {
    createFile: boolean
    rename: boolean
    delete: boolean
    fileInfo: boolean
    share: boolean
  }
  