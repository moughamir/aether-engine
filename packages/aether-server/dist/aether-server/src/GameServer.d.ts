import { Server } from 'socket.io';
import { SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
export interface GameServerOptions {
    tickRate?: number;
}
export declare class GameServer {
    private io;
    private supabase;
    private redis;
    private roomManager;
    private entityManager;
    private tickRate;
    private tickInterval;
    constructor(io: Server, supabase: SupabaseClient, redis: Redis, options?: GameServerOptions);
    private setupSocketHandlers;
    private startGameLoop;
    private tick;
    stop(): void;
}
