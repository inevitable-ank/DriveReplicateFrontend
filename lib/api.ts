const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to make API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token'); // or use cookies
  
  // Don't set Content-Type for FormData (browser will set it with boundary)
  const headers: HeadersInit = {};
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    credentials: 'include', // Important for CORS with credentials
  });

  // Handle 204 No Content responses (no response body)
  if (response.status === 204) {
    if (!response.ok) {
      throw new Error('An error occurred');
    }
    return {} as T;
  }

  // Check if response has content before parsing JSON
  const contentType = response.headers.get('content-type');
  const hasJsonContent = contentType && contentType.includes('application/json');
  
  // Get response text first to check if it's empty
  const text = await response.text();
  
  if (!response.ok) {
    // Try to parse error message from JSON if available
    if (hasJsonContent && text) {
      try {
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'An error occurred');
      } catch {
        throw new Error(text || 'An error occurred');
      }
    }
    throw new Error(text || 'An error occurred');
  }

  // Parse JSON only if there's content and it's JSON
  if (hasJsonContent && text) {
    try {
      return JSON.parse(text) as T;
    } catch (error) {
      // If JSON parsing fails, return empty object
      console.warn('Failed to parse JSON response:', error);
      return {} as T;
    }
  }

  // Return empty object if no content
  return {} as T;
}

// Auth API functions
export const authAPI = {
  signup: async (name: string, email: string, password: string) => {
    const response = await apiCall<{
      success: boolean;
      message: string;
      data: {
        user: {
          id: string;
          name: string;
          email: string;
          picture: string | null;
          provider: string;
        };
        token: string;
      };
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiCall<{
      success: boolean;
      message: string;
      data: {
        user: {
          id: string;
          name: string;
          email: string;
          picture: string | null;
          provider: string;
        };
        token: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiCall<{
      success: boolean;
      message: string;
      data: {
        user: {
          id: string;
          name: string;
          email: string;
          picture: string | null;
          provider: string;
        };
      };
    }>('/auth/me', {
      method: 'GET',
    });
    return response.data.user;
  },

  logout: async () => {
    await apiCall('/auth/logout', {
      method: 'POST',
    });
  },

  // Google OAuth callback handler
  handleGoogleCallback: async (code: string) => {
    const response = await apiCall<{
      success: boolean;
      message: string;
      data: {
        user: {
          id: string;
          name: string;
          email: string;
          picture: string | null;
          provider: string;
        };
        token: string;
      };
    }>('/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    return response.data;
  },
};

// File API functions
export const fileAPI = {
  // Get all files (matches backend: GET /api/files?limit=100&offset=0)
  getFiles: async (limit: number = 100, offset: number = 0) => {
    const queryParams = new URLSearchParams();
    queryParams.append("limit", limit.toString());
    queryParams.append("offset", offset.toString());
    
    const response = await apiCall<{
      success: boolean;
      data: { files: any[] };
    }>(`/files?${queryParams.toString()}`, {
      method: "GET",
    });
    return response.data.files;
  },

  // Search files (matches backend: GET /api/files/search?q=term)
  searchFiles: async (query: string) => {
    const response = await apiCall<{
      success: boolean;
      data: { files: any[] };
    }>(`/files/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
    });
    return response.data.files;
  },

  // Upload file (matches backend: POST /api/files/upload)
  uploadFile: async (file: File, customName?: string, parentId?: string | null) => {
    const formData = new FormData();
    formData.append("file", file);
    if (customName) {
      formData.append("name", customName);
    }
    if (parentId) {
      formData.append("parent_id", parentId);
    }

    const response = await apiCall<{
      success: boolean;
      data: { file: any };
    }>("/files/upload", {
      method: "POST",
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary
      headers: {},
    });
    return response.data.file;
  },

  // Create folder (matches backend: POST /api/files/folder)
  createFolder: async (folderName: string, parentId?: string) => {
    const response = await apiCall<{
      success: boolean;
      data: { folder: any };
    }>("/files/folder", {
      method: "POST",
      body: JSON.stringify({ 
        name: folderName,
        parent_id: parentId || null 
      }),
    });
    return response.data.folder;
  },

  // Delete file/folder
  deleteFile: async (fileId: string) => {
    await apiCall(`/files/${fileId}`, {
      method: "DELETE",
    });
  },

  // Rename file/folder (matches backend: PATCH /api/files/:id/rename)
  renameFile: async (fileId: string, newName: string) => {
    const response = await apiCall<{
      success: boolean;
      data: { file: any };
    }>(`/files/${fileId}/rename`, {
      method: "PATCH",
      body: JSON.stringify({ name: newName }),
    });
    return response.data.file;
  },

  // Get file preview URL (for viewing in browser)
  getFilePreviewUrl: async (fileId: string): Promise<string> => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/files/${fileId}/download`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error("Failed to load file preview");
    }
    
    const blob = await response.blob();
    return window.URL.createObjectURL(blob);
  },

  // Download file
  downloadFile: async (fileId: string, fileName: string) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/files/${fileId}/download`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!response.ok) throw new Error("Download failed");
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const contentDisposition = response.headers.get("Content-Disposition");
    const downloadName = contentDisposition 
      ? contentDisposition.split("filename=")[1]?.replace(/"/g, "") || fileName
      : fileName;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Get file info (matches backend: GET /api/files/:id)
  getFileInfo: async (fileId: string) => {
    const response = await apiCall<{
      success: boolean;
      data: { file: any };
    }>(`/files/${fileId}`, {
      method: "GET",
    });
    return response.data.file;
  },

  // Share file with user
  shareFile: async (fileId: string, email: string, permission: "view" | "edit" = "view") => {
    const response = await apiCall<{
      success: boolean;
      data: { file: any; shared_with: any };
    }>(`/files/${fileId}/share`, {
      method: "POST",
      body: JSON.stringify({ email, permission }),
    });
    return response.data;
  },

  // Get share information for a file
  getShareInfo: async (fileId: string) => {
    const response = await apiCall<{
      success: boolean;
      data: {
        shared_with: any[];
        share_link: any;
      };
    }>(`/files/${fileId}/share`, {
      method: "GET",
    });
    return response.data;
  },

  // Create shareable link
  createShareLink: async (fileId: string, permission: "view" | "edit" = "view") => {
    const response = await apiCall<{
      success: boolean;
      data: {
        share_link: string;
        token: string;
        permission: string;
        expires_at: string | null;
      };
    }>(`/files/${fileId}/share-link`, {
      method: "POST",
      body: JSON.stringify({ permission }),
    });
    // Transform backend response to match frontend structure
    return {
      enabled: true,
      link: response.data.share_link,
      token: response.data.token,
      permission: response.data.permission,
      expires_at: response.data.expires_at,
    };
  },

  // Revoke share access for a user
  revokeShareAccess: async (fileId: string, userId: string) => {
    await apiCall(`/files/${fileId}/share/${userId}`, {
      method: "DELETE",
    });
  },

  // Remove share link
  removeShareLink: async (fileId: string) => {
    await apiCall(`/files/${fileId}/share-link`, {
      method: "DELETE",
    });
  },

  // Get shared files (files shared with me)
  getSharedFiles: async () => {
    const response = await apiCall<{
      success: boolean;
      data: { files: any[] };
    }>("/files/shared", {
      method: "GET",
    });
    return response.data.files;
  },

  // Get shared file by token (for accessing via share link)
  getSharedFileByToken: async (token: string) => {
    const response = await apiCall<{
      success: boolean;
      data: { file: any };
    }>(`/files/shared/${token}`, {
      method: "GET",
    });
    return response.data.file;
  },

  // Download shared file using share token (no auth required)
  // Try multiple approaches since backend might support different methods
  downloadSharedFile: async (shareToken: string, fileName: string, fileId?: string) => {
    // Try approach 1: Direct download endpoint with share token
    let response = await fetch(
      `${API_BASE_URL}/files/shared/${shareToken}/download`,
      {
        method: "GET",
      }
    );
    
    // If that fails and we have fileId, try approach 2: Use fileId with share token as query param
    if (!response.ok && fileId) {
      response = await fetch(
        `${API_BASE_URL}/files/${fileId}/download?shareToken=${encodeURIComponent(shareToken)}`,
        {
          method: "GET",
        }
      );
    }
    
    // If that fails and we have fileId, try approach 3: Use fileId with share token in header
    if (!response.ok && fileId) {
      response = await fetch(
        `${API_BASE_URL}/files/${fileId}/download`,
        {
          method: "GET",
          headers: {
            'X-Share-Token': shareToken,
          },
        }
      );
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Download failed";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const contentDisposition = response.headers.get("Content-Disposition");
    const downloadName = contentDisposition 
      ? contentDisposition.split("filename=")[1]?.replace(/"/g, "") || fileName
      : fileName;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

