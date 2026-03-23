import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:2350/umuryangoremezo/backend", locally
  // Online backend
  baseURL : "https://ur-mt-mariko.onrender.com"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
