export const setUserSession = (user: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
    }
  }
  
  export const getUserSession = () => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user")
      return user ? JSON.parse(user) : null
    }
    return null
  }
  
  export const clearUserSession = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    }
  }

  export const setToken = (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
  }

  export const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token")
    }
    return null
  }
  