"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const socket_io_1 = require("socket.io");
const redis_1 = require("./redis");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const roomUsers = new Map();
const roomDocs = new Map();
const roomOwners = new Map();
const RATE_WINDOW_MS = 1000;
const MAX_EVENTS_PER_WINDOW = 10;
function setupSocket(server, origin) {
    const io = new socket_io_1.Server(server, {
        cors: { origin, credentials: true },
    });
    const { pubClient, subClient } = (0, redis_1.createRedisClients)();
    if (pubClient && subClient)
        io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
    io.on("connection", (socket) => {
        const rateState = { timestamps: [] };
        const checkRateLimit = () => {
            const now = Date.now();
            rateState.timestamps = rateState.timestamps.filter((t) => now - t < RATE_WINDOW_MS);
            if (rateState.timestamps.length >= MAX_EVENTS_PER_WINDOW)
                return false;
            rateState.timestamps.push(now);
            return true;
        };
        socket.on("join-room", (payload) => {
            const { roomId, user } = payload;
            socket.data.roomId = roomId;
            socket.data.userId = user.id;
            socket.join(roomId);
            if (!roomOwners.has(roomId))
                roomOwners.set(roomId, user.id);
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
            if (!checkRateLimit())
                return;
            const { roomId, html, userId } = payload;
            roomDocs.set(roomId, html);
            socket.to(roomId).emit("editor-update", { html, userId });
        });
        socket.on("cursor-update", (payload) => {
            if (!checkRateLimit())
                return;
            const { roomId, userId, isTyping } = payload;
            const users = roomUsers.get(roomId);
            if (users) {
                for (const [sockId, u] of users.entries()) {
                    if (u.id === userId)
                        users.set(sockId, { ...u, isTyping });
                }
                io.to(roomId).emit("presence-state", {
                    users: Array.from(users.values()),
                    ownerId: roomOwners.get(roomId),
                });
            }
            socket.to(roomId).emit("cursor-update", payload);
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
        socket.on("call-offer", (payload) => {
            socket.to(payload.roomId).emit("call-offer", {
                offer: payload.offer,
                from: socket.id,
            });
        });
        socket.on("call-answer", (payload) => {
            socket.to(payload.roomId).emit("call-answer", {
                answer: payload.answer,
                from: socket.id,
            });
        });
        socket.on("ice-candidate", (payload) => {
            socket.to(payload.roomId).emit("ice-candidate", {
                candidate: payload.candidate,
                from: socket.id,
            });
        });
        socket.on("end-call", (payload) => {
            socket.to(payload.roomId).emit("end-call");
        });
        socket.on("call-join-request", (payload) => {
            socket.to(payload.roomId).emit("call-join-request", payload);
        });
        socket.on("call-join-response", (payload) => {
            io.to(payload.requesterSocketId).emit("call-join-response", payload);
        });
        socket.on("call-chat", (payload) => {
            socket.to(payload.roomId).emit("call-chat", payload);
        });
        socket.on("call-media-state", (payload) => {
            socket.to(payload.roomId).emit("call-media-state", payload);
        });
        socket.on("call-raise-hand", (payload) => {
            socket.to(payload.roomId).emit("call-raise-hand", payload);
        });
        socket.on("call-screen-share", (payload) => {
            socket.to(payload.roomId).emit("call-screen-share", payload);
        });
        socket.on("call-speaking", (payload) => {
            socket.to(payload.roomId).emit("call-speaking", payload);
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
        });
    });
    return io;
}
