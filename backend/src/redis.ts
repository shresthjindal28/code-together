// src/redis.ts
import Redis from "ioredis";

export type RedisClients = {
  pubClient: Redis | null;
  subClient: Redis | null;
};

export function createRedisClients(): RedisClients {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.log("[redis] REDIS_URL not set, running without Redis adapter");
    return { pubClient: null, subClient: null };
  }

  const useTls = url.includes("rediss://") || url.includes("upstash.io");

  const pubClient = new Redis(url, useTls ? { tls: {} } : {});
  const subClient = pubClient.duplicate();

  pubClient.on("connect", () => console.log("✔ Redis connected"));
  pubClient.on("error", (err) =>
    console.error("❌ Redis error:", err)
  );

  return { pubClient, subClient };
}
