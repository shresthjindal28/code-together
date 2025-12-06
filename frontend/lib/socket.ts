import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!url) {
      throw new Error("NEXT_PUBLIC_SOCKET_URL is not set");
    }

    socket = io(url, {
      transports: ["websocket"],
      withCredentials: true,
    });
  }
  return socket;
}