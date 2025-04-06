import { Server } from "socket.io";
import { SupabaseClient } from "@supabase/supabase-js";
import Redis from "ioredis";
import { RoomManager } from "./roomManager";
import { EntityManager } from "./entityManager";

export interface GameServerOptions {
  tickRate?: number;
}

export class GameServer {
  private roomManager: RoomManager;
  private entityManager: EntityManager;
  private tickRate: number;
  private isRunning = false;

  constructor(
    io: Server,
    supabase: SupabaseClient,
    private redis: Redis,
    options?: GameServerOptions
  ) {
    this.tickRate = options?.tickRate || 60;
    this.roomManager = new RoomManager(io, redis);
    this.entityManager = new EntityManager(supabase, redis);
  }

  async startGameLoop() {
    this.isRunning = true;
    const tickInterval = 1000 / this.tickRate;

    try {
      while (this.isRunning) {
        const startTime = Date.now();
        const roomStates = await this.roomManager.getAllRoomStates();

        try {
          await this.entityManager.processPhysics(roomStates);
          this.roomManager.broadcastStates(roomStates);
        } catch (physicsError) {
          console.error("Physics processing error:", physicsError);
        }

        const processingTime = Date.now() - startTime;
        await new Promise((resolve) =>
          setTimeout(resolve, Math.max(tickInterval - processingTime, 0))
        );
      }
    } catch (error) {
      console.error("Game loop fatal error:", error);
      this.shutdown();
    }
  }

  shutdown() {
    this.isRunning = false;
    try {
      this.redis.quit();
    } catch (redisError) {
      console.error("Redis shutdown error:", redisError);
    }
  }
}
