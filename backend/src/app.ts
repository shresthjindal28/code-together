import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json());

  const FRONTEND_ORIGIN =
    process.env.FRONTEND_ORIGIN || "http://localhost:3000";

  app.use(
    cors({
      origin: FRONTEND_ORIGIN,
      credentials: true,
    })
  );

  app.use(
    rateLimit({
      windowMs: 10 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get("/health", (_: Request, res: Response) => {
    res.json({ ok: true });
  });



  return app;
}
