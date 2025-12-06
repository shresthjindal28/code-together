// src/server.ts
import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";

import { createApp } from "./app";
import { createRedisClients } from "./redis";
import { createAdapter } from "@socket.io/redis-adapter";

dotenv.config();

const PORT = Number(process.env.PORT || 4000);
const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || "http://localhost:3000";

type PresenceUser = {
  id: string;
  name: string;
  color: string;
  isTyping: boolean;
};

const roomUsers = new Map<string, Map<string, PresenceUser>>();
const roomDocs = new Map<string, string>();

async function main() {
  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: FRONTEND_ORIGIN,
      credentials: true,
    },
  });

  const { pubClient, subClient } = createRedisClients();
  if (pubClient && subClient) {
    io.adapter(createAdapter(pubClient, subClient));
    console.log("[socket] Using Redis adapter");
  } else {
    console.log("[socket] Running without Redis adapter (single instance)");
  }

  io.on("connection", (socket) => {
    console.log("[socket] connected", socket.id);

    socket.on(
      "join-room",
      (payload: {
        roomId: string;
        user: { id: string; name: string; color: string };
      }) => {
        const { roomId, user } = payload;

        // TODO: real Clerk auth/room-check here
        // isUserAllowedInRoom(user.id, roomId) -> if false, return

        socket.join(roomId);
        (socket.data as any).roomId = roomId;
        (socket.data as any).userId = user.id;

        let users = roomUsers.get(roomId);
        if (!users) {
          users = new Map();
          roomUsers.set(roomId, users);
        }

        users.set(socket.id, {
          id: user.id,
          name: user.name,
          color: user.color,
          isTyping: false,
        });

        io.to(roomId).emit("presence-state", {
          users: Array.from(users.values()),
        });

        const html = roomDocs.get(roomId);
        if (html) {
          socket.emit("editor-init", { html });
        }
      }
    );

    socket.on(
      "editor-update",
      (payload: { roomId: string; html: string; userId: string }) => {
        const { roomId, html, userId } = payload;
        roomDocs.set(roomId, html);

        socket.to(roomId).emit("editor-update", {
          html,
          userId,
        });
      }
    );

    socket.on(
      "cursor-update",
      (payload: {
        roomId: string;
        userId: string;
        name: string;
        color: string;
        isTyping: boolean;
      }) => {
        const { roomId, userId, name, color, isTyping } = payload;

        const users = roomUsers.get(roomId);
        if (users) {
          const entry = Array.from(users.entries()).find(
            ([, u]) => u.id === userId
          );
          if (entry) {
            const [key, u] = entry;
            users.set(key, { ...u, isTyping });
          }
          io.to(roomId).emit("presence-state", {
            users: Array.from(users.values()),
          });
        }

        socket.to(roomId).emit("cursor-update", {
          userId,
          name,
          color,
          isTyping,
        });
      }
    );

    socket.on("leave-room", ({ roomId }: { roomId: string }) => {
      const users = roomUsers.get(roomId);
      if (users) {
        users.delete(socket.id);
        io.to(roomId).emit("presence-state", {
          users: Array.from(users.values()),
        });
      }
      socket.leave(roomId);
    });

    socket.on("disconnect", () => {
      const roomId = (socket.data as any).roomId as string | undefined;
      if (roomId) {
        const users = roomUsers.get(roomId);
        if (users) {
          users.delete(socket.id);
          io.to(roomId).emit("presence-state", {
            users: Array.from(users.values()),
          });
        }
      }
      console.log("[socket] disconnected", socket.id);
    });
  });

  server.listen(PORT, () => {
    console.log(`[server] Listening on port ${PORT}`);
    console.log(`[server] Allowed frontend origin: ${FRONTEND_ORIGIN}`);
  });
}

main().catch((err) => {
  console.error("[server] Fatal error", err);
  process.exit(1);
});
