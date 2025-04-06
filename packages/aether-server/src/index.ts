import express, { Express } from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { createClient } from "@supabase/supabase-js";
import Redis from "ioredis";
import dotenv from "dotenv";
import { GameServer } from "./GameServer";
dotenv.config();
const app: Express = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_KEY || ""
);
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const gameServer = new GameServer(io, supabase, redis, {
  tickRate: 30,
});
app.get("/health", (_req: express.Request, res: express.Response) =>
  res.json({ status: "ok" })
);
server.listen(process.env.PORT || 3301, () => {
  console.log(`Aether server running on port ${process.env.PORT || 3301}`);
});
export { app, server, io, supabase, redis, gameServer };
