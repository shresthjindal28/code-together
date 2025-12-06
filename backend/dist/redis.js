"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRedisClients = createRedisClients;
// src/redis.ts
const ioredis_1 = __importDefault(require("ioredis"));
function createRedisClients() {
    const url = process.env.REDIS_URL;
    if (!url) {
        console.log("[redis] REDIS_URL not set, running without Redis adapter");
        return { pubClient: null, subClient: null };
    }
    const useTls = url.includes("rediss://") || url.includes("upstash.io");
    const pubClient = new ioredis_1.default(url, useTls ? { tls: {} } : {});
    const subClient = pubClient.duplicate();
    pubClient.on("connect", () => console.log("✔ Redis connected"));
    pubClient.on("error", (err) => console.error("❌ Redis error:", err));
    return { pubClient, subClient };
}
