"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameServer = void 0;
const shared_1 = require("@aether/shared");
const RoomManager_1 = require("./RoomManager");
const EntityManager_1 = require("./EntityManager");
class GameServer {
    constructor(io, supabase, redis, options = {}) {
        Object.defineProperty(this, "io", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "supabase", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "redis", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "roomManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "entityManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tickRate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tickInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.io = io;
        this.supabase = supabase;
        this.redis = redis;
        this.tickRate = options.tickRate || 20; // 20 ticks per second by default
        this.roomManager = new RoomManager_1.RoomManager(io, redis);
        this.entityManager = new EntityManager_1.EntityManager(supabase, redis);
        this.setupSocketHandlers();
        this.startGameLoop();
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`Client connected: ${socket.id}`);
            // Handle authentication
            socket.on('authenticate', async (token) => {
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
                }
                catch (err) {
                    console.error('Authentication error:', err);
                    socket.emit('auth_error', { message: 'Authentication failed' });
                }
            });
            // Handle room joining
            socket.on('join_room', (roomId) => {
                if (!socket.data.user) {
                    socket.emit('error', { message: 'Not authenticated' });
                    return;
                }
                this.roomManager.joinRoom(socket, roomId);
            });
            // Handle entity creation
            socket.on(shared_1.MessageType.ENTITY_CREATE, (message) => {
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
                    socket.to(roomId).emit(shared_1.MessageType.ENTITY_CREATE, {
                        type: shared_1.MessageType.ENTITY_CREATE,
                        data: entity,
                        timestamp: Date.now(),
                        senderId: socket.id
                    });
                }
            });
            // Handle entity updates
            socket.on(shared_1.MessageType.ENTITY_UPDATE, (message) => {
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
                    socket.to(roomId).emit(shared_1.MessageType.ENTITY_UPDATE, {
                        type: shared_1.MessageType.ENTITY_UPDATE,
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
    startGameLoop() {
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
        }
        const tickDuration = 1000 / this.tickRate;
        this.tickInterval = setInterval(() => {
            this.tick();
        }, tickDuration);
    }
    tick() {
        // Update game state
        this.entityManager.update();
        // Broadcast updates to clients
        this.roomManager.broadcastUpdates();
    }
    stop() {
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }
    }
}
exports.GameServer = GameServer;
