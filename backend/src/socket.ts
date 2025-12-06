// src/socket.ts
import type { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import type { RedisAdapter } from "@socket.io/redis-adapter";

type EditorUpdatePayload = {
  roomId: string;
  content: string;
};

type CursorUpdatePayload = {
  roomId: string;
  userId: string;
  name: string;
  cursor: { from: number; to: number };
};

type JoinRoomPayload = {
  roomId: string;
  userId: string;
  name: string;
};

export function createSocketServer(
  server: HTTPServer,
  opts?: { adapter?: any }
) {

  const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

  const io = new Server(server, {
    cors: {
      origin: FRONTEND_ORIGIN,
      credentials: true,
    },
  });

  if (opts?.adapter) {
    io.adapter(opts.adapter);
  }

  io.on("connection", (socket) => {
    console.log("[socket] client connected", socket.id);

    socket.on("join-room", (data: JoinRoomPayload) => {
      const { roomId, userId, name } = data || {};

      if (!roomId || typeof roomId !== "string") return;
      socket.join(roomId);

      socket.data.userId = userId;
      socket.data.name = name;
      socket.data.roomId = roomId;

      io.to(roomId).emit("presence-update", {
        type: "join",
        userId,
        name,
        socketId: socket.id,
      });

      console.log(`[socket] ${socket.id} joined room ${roomId}`);
    });

    socket.on("leave-room", (roomId: string) => {
      if (!roomId) return;
      socket.leave(roomId);

      io.to(roomId).emit("presence-update", {
        type: "leave",
        userId: socket.data.userId,
        name: socket.data.name,
        socketId: socket.id,
      });

      console.log(`[socket] ${socket.id} left room ${roomId}`);
    });

    socket.on("editor-update", (payload: EditorUpdatePayload) => {
      if (!payload?.roomId || typeof payload.content !== "string") return;

      // Basic protection: ignore crazy huge payloads
      if (payload.content.length > 200_000) return;

      // Broadcast to everyone else in the room
      socket.to(payload.roomId).emit("editor-update", {
        content: payload.content,
        userId: socket.data.userId,
      });
    });

    socket.on("cursor-update", (payload: CursorUpdatePayload) => {
      if (!payload?.roomId) return;

      socket.to(payload.roomId).emit("cursor-update", {
        userId: payload.userId,
        name: payload.name,
        cursor: payload.cursor,
      });
    });

    socket.on("disconnect", () => {
      const roomId = socket.data.roomId as string | undefined;

      if (roomId) {
        io.to(roomId).emit("presence-update", {
          type: "leave",
          userId: socket.data.userId,
          name: socket.data.name,
          socketId: socket.id,
        });
      }

      console.log("[socket] client disconnected", socket.id);
    });
  });

  return io;
}
