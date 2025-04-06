import dotenv from "dotenv";
dotenv.config();

interface Config {
  port: number;
  redisUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
  tickRate: number;
  corsOrigin: string;
}

function getConfig(): Config {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3301;
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_KEY || "";
  const tickRate = process.env.TICK_RATE
    ? parseInt(process.env.TICK_RATE, 10)
    : 30;
  const corsOrigin = process.env.CORS_ORIGIN || "*";

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase URL or Key not provided in environment variables.");
  }

  return {
    port,
    redisUrl,
    supabaseUrl,
    supabaseKey,
    tickRate,
    corsOrigin,
  };
}

export const config = getConfig();
