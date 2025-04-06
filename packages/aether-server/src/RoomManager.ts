import { Server } from "socket.io";
import Redis from "ioredis";

export class RoomManager {
  constructor(
    private io: Server,
    private redis: Redis
  ) {}

  async getAllRoomStates() {
    const roomKeys = await this.redis.keys("room:*");
    return Promise.all(
      roomKeys.map(async (key) => ({
        id: key.split(":")[1],
        state: JSON.parse((await this.redis.get(key)) || "{}"),
      }))
    );
  }

  broadcastStates(states: any[]) {
    states.forEach((roomState) => {
      this.io.to(roomState.id).emit("state_update", {
        timestamp: Date.now(),
        ...roomState.state,
      });
    });
  }

  async createRoom(roomId: string) {
    await this.redis.set(
      `room:${roomId}`,
      JSON.stringify({
        entities: [],
        physicsState: {},
      })
    );
    this.redis.sadd("rooms", roomId);
  }
}
