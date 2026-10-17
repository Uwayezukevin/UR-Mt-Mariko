import axios from "axios";
import { API_BASE, MESSAGES_BASE } from "./config";

const createClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  // Attach bearer token from storage when present
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Normalize auth failures: clear stale session and notify the app once.
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Let any listener (e.g. AuthContext) react without forcing a redirect.
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Main backend API client
const api = createClient(API_BASE);

// Contact/messages API client (separate backend mount point)
export const messagesApi = createClient(MESSAGES_BASE);

export default api;
