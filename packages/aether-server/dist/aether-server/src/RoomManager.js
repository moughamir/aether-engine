"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const shared_1 = require("@aether/shared");
class RoomManager {
    constructor(io, redis) {
        Object.defineProperty(this, "io", {
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
        Object.defineProperty(this, "rooms", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        }); // roomId -> Set of socketIds
        this.io = io;
        this.redis = redis;
    }
    async joinRoom(socket, roomId) {
        // Leave current rooms first
        this.leaveAllRooms(socket);
        // Join new room
        await socket.join(roomId);
        // Add to our room tracking
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId)?.add(socket.id);
        // Store room data in Redis for persistence
        await this.redis.sadd(`room:${roomId}:members`, socket.id);
        // Notify room members
        socket.to(roomId).emit(shared_1.MessageType.PLAYER_JOIN, {
            type: shared_1.MessageType.PLAYER_JOIN,
            data: {
                userId: socket.data.user?.id,
                socketId: socket.id
            },
            timestamp: Date.now()
        });
        // Send room state to the joining client
        const roomState = await this.getRoomState(roomId);
        socket.emit('room_state', roomState);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    }
    leaveAllRooms(socket) {
        // Find all rooms this socket is in
        for (const [roomId, members] of this.rooms.entries()) {
            if (members.has(socket.id)) {
                members.delete(socket.id);
                // Remove from Redis
                this.redis.srem(`room:${roomId}:members`, socket.id).catch(console.error);
                // Notify room members
                socket.to(roomId).emit(shared_1.MessageType.PLAYER_LEAVE, {
                    type: shared_1.MessageType.PLAYER_LEAVE,
                    data: {
                        userId: socket.data.user?.id,
                        socketId: socket.id
                    },
                    timestamp: Date.now()
                });
                console.log(`Socket ${socket.id} left room ${roomId}`);
            }
        }
        // Leave all Socket.IO rooms
        for (const room of socket.rooms) {
            if (room !== socket.id) { // Skip the default room
                socket.leave(room);
            }
        }
    }
    async getRoomState(roomId) {
        // Get all entities in this room from Redis
        const entityIds = await this.redis.smembers(`room:${roomId}:entities`);
        const entities = [];
        for (const id of entityIds) {
            const entityData = await this.redis.get(`entity:${id}`);
            if (entityData) {
                entities.push(JSON.parse(entityData));
            }
        }
        return {
            roomId,
            entities
        };
    }
    broadcastUpdates() {
        // This method would be called on each game tick
        // It could broadcast entity updates to all clients in each room
        // For now, it's a placeholder
    }
}
exports.RoomManager = RoomManager;
