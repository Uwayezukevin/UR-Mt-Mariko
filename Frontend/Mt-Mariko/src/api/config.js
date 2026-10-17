// Central API configuration.
// Override the backend host with VITE_SERVER_URL in your environment.
export const SERVER_ORIGIN =
  import.meta.env.VITE_SERVER_URL || "https://ur-mt-mariko.onrender.com";

export const API_BASE = `${SERVER_ORIGIN}/umuryangoremezo/backend`;

// Messages are mounted outside the main API namespace on the backend.
export const MESSAGES_BASE = `${SERVER_ORIGIN}/messages`;
