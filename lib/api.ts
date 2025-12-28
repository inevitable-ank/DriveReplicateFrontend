const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to make API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token'); // or use cookies
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
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

