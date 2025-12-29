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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
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
  uploadFile: async (file: File, customName?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (customName) {
      formData.append("name", customName);
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
};

