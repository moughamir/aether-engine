import { Server, Socket } from 'socket.io';
import { SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { MessageType, NetworkMessage, Entity } from '@aether/shared';
import { RoomManager } from './RoomManager';
import { EntityManager } from './EntityManager';

export interface GameServerOptions {
  tickRate?: number;
}

export class GameServer {
  private io: Server;
  private supabase: SupabaseClient;
  private redis: Redis;
  private roomManager: RoomManager;
  private entityManager: EntityManager;
  private tickRate: number;
  private tickInterval: NodeJS.Timeout | null = null;
  
  constructor(io: Server, supabase: SupabaseClient, redis: Redis, options: GameServerOptions = {}) {
    this.io = io;
    this.supabase = supabase;
    this.redis = redis;
    this.tickRate = options.tickRate || 20; // 20 ticks per second by default
    
    this.roomManager = new RoomManager(io, redis);
    this.entityManager = new EntityManager(supabase, redis);
    
    this.setupSocketHandlers();
    this.startGameLoop();
  }
  
  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Handle authentication
      socket.on('authenticate', async (token: string) => {
        try {
          // Verify token with Supabase
          const { data, error } = await this.supabase.auth.getUser(token);
          
          if (error || !data.user) {
            socket.emit('auth_error', { message: 'Authentication failed' });
            return;
          }
          
          // Store user data in socket
          socket.data.user = data.user;
          socket.emit('authenticated', { userId: data.user.id });
          
          // Join default room
          this.roomManager.joinRoom(socket, 'lobby');
        } catch (err) {
          console.error('Authentication error:', err);
          socket.emit('auth_error', { message: 'Authentication failed' });
        }
      });
      
      // Handle room joining
      socket.on('join_room', (roomId: string) => {
        if (!socket.data.user) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }
        
        this.roomManager.joinRoom(socket, roomId);
      });
      
      // Handle entity creation
      socket.on(MessageType.ENTITY_CREATE, (message: NetworkMessage<Entity>) => {
        if (!socket.data.user) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }
        
        const entity = message.data;
        entity.components.ownerId = socket.data.user.id;
        
        this.entityManager.createEntity(entity);
        
        // Broadcast to room
        const roomId = Array.from(socket.rooms).find(room => room !== socket.id);
        if (roomId) {
          socket.to(roomId).emit(MessageType.ENTITY_CREATE, {
            type: MessageType.ENTITY_CREATE,
            data: entity,
            timestamp: Date.now(),
            senderId: socket.id
          });
        }
      });
      
      // Handle entity updates
      socket.on(MessageType.ENTITY_UPDATE, (message: NetworkMessage<Partial<Entity>>) => {
        if (!socket.data.user) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }
        
        const entityUpdate = message.data;
        if (!entityUpdate.id) {
          socket.emit('error', { message: 'Entity ID is required' });
          return;
        }
        
        this.entityManager.updateEntity(entityUpdate.id, entityUpdate);
        
        // Broadcast to room
        const roomId = Array.from(socket.rooms).find(room => room !== socket.id);
        if (roomId) {
          socket.to(roomId).emit(MessageType.ENTITY_UPDATE, {
            type: MessageType.ENTITY_UPDATE,
            data: entityUpdate,
            timestamp: Date.now(),
            senderId: socket.id
          });
        }
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.roomManager.leaveAllRooms(socket);
      });
    });
  }
  
  private startGameLoop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }
    
    const tickDuration = 1000 / this.tickRate;
    
    this.tickInterval = setInterval(() => {
      this.tick();
    }, tickDuration);
  }
  
  private tick(): void {
    // Update game state
    this.entityManager.update();
    
    // Broadcast updates to clients
    this.roomManager.broadcastUpdates();
  }
  
  public stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }
}