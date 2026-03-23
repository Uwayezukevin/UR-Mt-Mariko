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
    console.log("🔐 Token from localStorage:", token ? `${token.substring(0, 20)}...` : "MISSING");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Authorization header set for:", config.url);
    } else {
      console.warn("⚠️ No token found for:", config.url);
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ Response error:", error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      console.log("🔒 401 Unauthorized - Removing token and redirecting");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;