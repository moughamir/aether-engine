import { NetworkMessage } from "@aether/shared";
import { ResourcePool } from "./resourcePool";

/**
 * Initialize the resource pools used throughout the application
 */
export function initResourcePool(): void {
  ResourcePool.register<NetworkMessage>(
    "NetworkMessage",
    () => ({ type: undefined as any, data: undefined, timestamp: 0 }),
    (obj: NetworkMessage) => {
      obj.type = undefined as any;
      obj.data = undefined;
      obj.timestamp = 0;
      obj.senderId = undefined;
    },
    200
  );
}
