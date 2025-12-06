"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const server = http_1.default.createServer(app_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
let sharedText = "";
const roomTexts = {};
io.on("connection", (socket) => {
    socket.emit("text-update", sharedText);
    socket.on("join-room", ({ roomId }) => {
        if (!roomId)
            return;
        socket.join(roomId);
        const html = roomTexts[roomId] || "";
        socket.emit("text-update-room", { roomId, html });
    });
    socket.on("leave-room", ({ roomId }) => {
        if (!roomId)
            return;
        socket.leave(roomId);
    });
    socket.on("text-change", (payload) => {
        if (typeof payload === "string") {
            sharedText = payload;
            socket.broadcast.emit("text-update", payload);
            return;
        }
        if (payload && typeof payload === "object" && typeof payload.roomId === "string" && typeof payload.html === "string") {
            const { roomId, html } = payload;
            roomTexts[roomId] = html;
            socket.to(roomId).emit("text-update-room", { roomId, html });
        }
    });
    socket.on("text-change-room", ({ roomId, html }) => {
        if (!roomId || typeof html !== "string")
            return;
        roomTexts[roomId] = html;
        socket.to(roomId).emit("text-update-room", { roomId, html });
    });
    socket.on("cursor-move", (data) => {
        if (data && typeof data.roomId === "string") {
            socket.to(data.roomId).emit("cursor-update-room", data);
        }
        else {
            socket.broadcast.emit("cursor-update", data);
        }
    });
    socket.on("cursor-move-room", (data) => {
        if (!data || typeof data.roomId !== "string")
            return;
        socket.to(data.roomId).emit("cursor-update-room", data);
    });
    socket.on("disconnect", () => {
        socket.broadcast.emit("cursor-left", socket.id);
    });
});
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`🚀 Socket.IO server running on :${PORT}`);
});
