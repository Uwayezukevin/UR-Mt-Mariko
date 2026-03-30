import axios from "axios";

const api = axios.create({
  baseURL: "https://ur-mt-mariko.onrender.com/umuryangoremezo/backend",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - NO REDIRECTS, just log errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors but don't redirect
    if (error.response?.status === 401) {
      console.log("🔒 401 Unauthorized - Token may be invalid or expired");
      // Optional: Clear token but DON'T redirect
      localStorage.removeItem("token");
    }
    
    if (error.response?.status === 404) {
      console.warn("⚠️ 404 Not Found - Endpoint:", error.config?.url);
    }
    
    // Just reject the promise - let components handle the error
    return Promise.reject(error);
  }
);

export default api;