// src/socket.ts
import http from "http";
import { Server } from "socket.io";
import { createRedisClients } from "./redis";
import { createAdapter } from "@socket.io/redis-adapter";

type PresenceUser = {
  id: string;
  name: string;
  color: string;
  isTyping: boolean;
  isOwner?: boolean;
};

type CursorSelection = {
  from: number;
  to: number;
};

const roomUsers = new Map<string, Map<string, PresenceUser>>();
const roomDocs = new Map<string, string>();
const roomOwners = new Map<string, string>(); // roomId -> ownerUserId

const RATE_WINDOW_MS = 1000;
const MAX_EVENTS_PER_WINDOW = 10;

type RateState = {
  timestamps: number[];
};

export function setupSocket(server: http.Server, origin: string) {
  const io = new Server(server, {
    cors: {
      origin,
      credentials: true,
    },
  });

  const { pubClient, subClient } = createRedisClients();
  if (pubClient && subClient) {
    io.adapter(createAdapter(pubClient, subClient));
    console.log("[socket] Using Redis adapter");
  } else {
    console.log("[socket] Running without Redis adapter");
  }

  io.on("connection", (socket) => {
    console.log("[socket] connected", socket.id);

    const rateState: RateState = { timestamps: [] };

    const checkRateLimit = (action: string): boolean => {
      const now = Date.now();
      rateState.timestamps = rateState.timestamps.filter(
        (t) => now - t < RATE_WINDOW_MS
      );
      if (rateState.timestamps.length >= MAX_EVENTS_PER_WINDOW) {
        const retryAfterMs =
          RATE_WINDOW_MS - (now - rateState.timestamps[0]);
        socket.emit("rate-limit", { action, retryAfterMs });
        return false;
      }
      rateState.timestamps.push(now);
      return true;
    };

    socket.on(
      "join-room",
      (payload: {
        roomId: string;
        user: {
          id: string;
          name: string;
          color: string;
          isOwner?: boolean;
        };
      }) => {
        const { roomId, user } = payload;

        (socket.data as any).roomId = roomId;
        (socket.data as any).userId = user.id;

        socket.join(roomId);

        // simple owner logic:
        // - if room has no owner yet, first user becomes owner
        // - OR you can trust payload.user.isOwner coming from your DB
        if (!roomOwners.has(roomId)) {
          roomOwners.set(roomId, user.id);
        }
        const ownerId = roomOwners.get(roomId);

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
          isOwner: ownerId === user.id,
        });

        io.to(roomId).emit("presence-state", {
          users: Array.from(users.values()),
          ownerId,
        });

        if (roomDocs.has(roomId)) {
          socket.emit("editor-init", { html: roomDocs.get(roomId) });
        }
      }
    );

    socket.on(
      "editor-update",
      (payload: { roomId: string; html: string; userId: string }) => {
        if (!checkRateLimit("editor-update")) return;

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
        selection: CursorSelection | null;
        isTyping: boolean;
      }) => {
        if (!checkRateLimit("cursor-update")) return;

        const { roomId, userId, name, color, isTyping, selection } = payload;

        const users = roomUsers.get(roomId);
        if (users) {
          for (const [sockId, u] of users.entries()) {
            if (u.id === userId) {
              users.set(sockId, {
                ...u,
                isTyping,
              });
            }
          }
          io.to(roomId).emit("presence-state", {
            users: Array.from(users.values()),
            ownerId: roomOwners.get(roomId),
          });
        }

        socket.to(roomId).emit("cursor-update", {
          userId,
          name,
          color,
          isTyping,
          selection,
        });
      }
    );

    socket.on("leave-room", ({ roomId }: { roomId: string }) => {
      socket.leave(roomId);

      const users = roomUsers.get(roomId);
      if (users) {
        users.delete(socket.id);
        io.to(roomId).emit("presence-state", {
          users: Array.from(users.values()),
          ownerId: roomOwners.get(roomId),
        });
      }
    });

    socket.on("disconnect", () => {
      const roomId = (socket.data as any).roomId as string | undefined;

      if (roomId) {
        const users = roomUsers.get(roomId);
        if (users) {
          users.delete(socket.id);
          io.to(roomId).emit("presence-state", {
            users: Array.from(users.values()),
            ownerId: roomOwners.get(roomId),
          });
        }
      }
      console.log("[socket] disconnected", socket.id);
    });
  });

  return io;
}
