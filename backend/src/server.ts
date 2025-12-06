import http from "http";
import dotenv from "dotenv";
import { createApp } from "./app";
import { setupSocket } from "./socket";

dotenv.config();

const PORT = Number(process.env.PORT || 4000);
const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || "http://localhost:3000";

 

async function main() {
  const app = createApp();
  const server = http.createServer(app);

  setupSocket(server, FRONTEND_ORIGIN);

  server.listen(PORT, () => {
    console.log(`[server] Listening on ${PORT}`);
    console.log(`[server] Allowed frontend origin: ${FRONTEND_ORIGIN}`);
  });
}

main().catch((error) => {
  console.error("[server] fatal error", error);
  process.exit(1);
});
