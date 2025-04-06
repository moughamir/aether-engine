import express, { Express } from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io"; // Renamed import to avoid conflict with 'server' const
import { createClient as createSupabaseClient } from "@supabase/supabase-js"; // Renamed import
import Redis from "ioredis";
import { GameServer } from "./gameServer"; // Assuming GameServer is in the same directory
import { config } from "./config"; // Import the config module
import { requestLoggerMiddleware } from "./middleware"

async function createServer(): Promise<{
  app: Express;
  server: http.Server;
  io: SocketIOServer;
  supabase: ReturnType<typeof createSupabaseClient>; // Type for Supabase client
  redis: Redis; // Corrected type annotation: Use 'Redis' directly
  gameServer: GameServer;
}> {
  const app: Express = express();
  app.use(requestLoggerMiddleware );
  app.use(cors({ origin: config.corsOrigin })); // Use CORS origin from config
  app.use(express.json());
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: { origin: config.corsOrigin, methods: ["GET", "POST"] }, // Use CORS origin from config
  });

  let supabaseClient: ReturnType<typeof createSupabaseClient>;
  try {
    supabaseClient = createSupabaseClient(
      config.supabaseUrl,
      config.supabaseKey
    );
    console.log("Supabase client initialized.");
  } catch (error) {
    console.error("Error initializing Supabase client:", error);
    throw error; // Propagate error to startServer
  }

  let redisClient: Redis; // Corrected type annotation here as well
  try {
    redisClient = new Redis(config.redisUrl);
    console.log("Redis client connected.");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    throw error; // Propagate error to startServer
  }

  const gameServer = new GameServer(io, supabaseClient, redisClient, {
    tickRate: config.tickRate, // Use tickRate from config
  });

  app.get("/health", (_req: express.Request, res: express.Response) =>
    res.json({ status: "ok" })
  );

  return {
    app,
    server,
    io,
    supabase: supabaseClient,
    redis: redisClient,
    gameServer,
  };
}

async function startServer(): Promise<{
  app: Express;
  server: http.Server;
  io: SocketIOServer;
  supabase: ReturnType<typeof createSupabaseClient>;
  redis: Redis; // Corrected type annotation here as well
  gameServer: GameServer;
}> {
  try {
    const serverInstances = await createServer();
    const { server, app } = serverInstances; // Destructure for easier access

    app.get("/startup-info", (_req, res) => {
      res.json({ startupTime: new Date() });
    });
    // Add more middleware specific to server startup context
    //app.use(myCustomStartupMiddleware());
    // Configure some app setting after initial creation
    app.set("trust proxy", true); // Example: trust proxy for production
    app.disable("x-powered-by"); // Example: security setting
    server.listen(config.port, () => {
      // Use port from config
      console.log(`Aether server running on port ${config.port}`);
    });

    return serverInstances; // Return all server instances
  } catch (error) {
    console.error("Server startup failed in startServer:", error);
    throw error; // Re-throw to be caught in main entry point
  }
}


export { startServer, createServer }; // Export startServer to be used in index.ts, and optionally createServer for testing or advanced use cases
