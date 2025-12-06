"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./app");
const socket_1 = require("./socket");
dotenv_1.default.config();
const PORT = Number(process.env.PORT || 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
async function main() {
    const app = (0, app_1.createApp)();
    const server = http_1.default.createServer(app);
    (0, socket_1.setupSocket)(server, FRONTEND_ORIGIN);
    server.listen(PORT, () => {
        console.log(`[server] Listening on ${PORT}`);
        console.log(`[server] Allowed frontend origin: ${FRONTEND_ORIGIN}`);
    });
}
main().catch((error) => {
    console.error("[server] fatal error", error);
    process.exit(1);
});
