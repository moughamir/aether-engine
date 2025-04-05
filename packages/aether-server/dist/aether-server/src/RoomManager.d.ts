import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
export declare class RoomManager {
    private io;
    private redis;
    private rooms;
    constructor(io: Server, redis: Redis);
    joinRoom(socket: Socket, roomId: string): Promise<void>;
    leaveAllRooms(socket: Socket): void;
    private getRoomState;
    broadcastUpdates(): void;
}
