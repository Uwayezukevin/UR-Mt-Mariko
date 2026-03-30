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

// Response interceptor - ONLY redirect on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 Unauthorized
    if (error.response?.status === 401) {
      console.log("🔒 401 Unauthorized - Redirecting to login");
      localStorage.removeItem("token");
      // Don't redirect if already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    // For 404, 500, etc., just reject and let components handle them
    return Promise.reject(error);
  }
);

export default api;