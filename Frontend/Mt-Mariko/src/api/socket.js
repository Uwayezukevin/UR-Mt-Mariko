import { io } from "socket.io-client";
import { SERVER_ORIGIN } from "./config";

// Shared socket factory so the server URL lives in one place.
export const createSocket = () =>
  io(SERVER_ORIGIN, {
    transports: ["websocket", "polling"],
    withCredentials: true,
  });

export default createSocket;
