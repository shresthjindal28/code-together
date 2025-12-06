"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
// src/app.ts
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use(express_1.default.json());
    const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
    app.use((0, cors_1.default)({
        origin: FRONTEND_ORIGIN,
        credentials: true,
    }));
    app.use((0, express_rate_limit_1.default)({
        windowMs: 10 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
    }));
    app.get("/health", (_req, res) => {
        res.json({ ok: true });
    });
    return app;
}
