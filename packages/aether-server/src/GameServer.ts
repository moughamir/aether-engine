import { Server } from 'socket.io';
import { SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { RoomManager } from './RoomManager';
import { EntityManager } from './EntityManager';

export interface GameServerOptions {
  tickRate?: number;
}

// Add proper redis usage
export class GameServer {
  private roomManager: RoomManager;
  private entityManager: EntityManager;
  private tickRate: number;
  private isRunning = false;

  constructor(
    private io: Server,
    private supabase: SupabaseClient,
    private redis: Redis,
    options?: GameServerOptions
  ) {
    this.tickRate = options?.tickRate || 60;
    this.roomManager = new RoomManager(io, redis);
    this.entityManager = new EntityManager(supabase, redis);
  }

  private gameLoopInterval?: NodeJS.Timeout;

  async start() {
    this.gameLoopInterval = setInterval(async () => {
      const roomStates = await this.roomManager.getAllRoomStates();
      await this.entityManager.processPhysics(roomStates);
      this.roomManager.broadcastStates(roomStates);
    }, 1000 / this.tickRate);
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
          console.error('Physics processing error:', physicsError);
        }

        const processingTime = Date.now() - startTime;
        await new Promise(resolve =>
          setTimeout(resolve, Math.max(tickInterval - processingTime, 0))
        );
      }
    } catch (error) {
      console.error('Game loop fatal error:', error);
      this.shutdown();
    }
  }

  shutdown() {
    this.isRunning = false;
    try {
      this.redis.quit();
    } catch (redisError) {
      console.error('Redis shutdown error:', redisError);
    }
  }
}
