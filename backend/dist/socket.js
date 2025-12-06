"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const socket_io_1 = require("socket.io");
const redis_1 = require("./redis");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const roomUsers = new Map();
const roomDocs = new Map();
const roomOwners = new Map(); // roomId -> ownerUserId
const RATE_WINDOW_MS = 1000;
const MAX_EVENTS_PER_WINDOW = 10;
function setupSocket(server, origin) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin,
            credentials: true,
        },
    });
    const { pubClient, subClient } = (0, redis_1.createRedisClients)();
    if (pubClient && subClient) {
        io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
        console.log("[socket] Using Redis adapter");
    }
    else {
        console.log("[socket] Running without Redis adapter");
    }
    io.on("connection", (socket) => {
        console.log("[socket] connected", socket.id);
        const rateState = { timestamps: [] };
        const checkRateLimit = (action) => {
            const now = Date.now();
            rateState.timestamps = rateState.timestamps.filter((t) => now - t < RATE_WINDOW_MS);
            if (rateState.timestamps.length >= MAX_EVENTS_PER_WINDOW) {
                const retryAfterMs = RATE_WINDOW_MS - (now - rateState.timestamps[0]);
                socket.emit("rate-limit", { action, retryAfterMs });
                return false;
            }
            rateState.timestamps.push(now);
            return true;
        };
        socket.on("join-room", (payload) => {
            const { roomId, user } = payload;
            socket.data.roomId = roomId;
            socket.data.userId = user.id;
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
        });
        socket.on("editor-update", (payload) => {
            if (!checkRateLimit("editor-update"))
                return;
            const { roomId, html, userId } = payload;
            roomDocs.set(roomId, html);
            socket.to(roomId).emit("editor-update", {
                html,
                userId,
            });
        });
        socket.on("cursor-update", (payload) => {
            if (!checkRateLimit("cursor-update"))
                return;
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
        });
        socket.on("leave-room", ({ roomId }) => {
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
            const roomId = socket.data.roomId;
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
