export enum MessageType {
  // Entity messages
  ENTITY_CREATE = "entity:create",
  ENTITY_UPDATE = "entity:update",
  ENTITY_DELETE = "entity:delete",
  ENTITY_SYNC = "entity:sync",
  // Player messages
  PLAYER_JOIN = "player:join",
  PLAYER_LEAVE = "player:leave",
  PLAYER_INPUT = "player:input",
  PLAYER_STATE = "player:state",
  // Room messages
  ROOM_JOIN = "room:join",
  ROOM_LEAVE = "room:leave",
  ROOM_LIST = "room:list",
  // Chat messages
  CHAT_MESSAGE = "chat:message",
  CHAT_PRIVATE = "chat:private",
  // System messages
  SYSTEM_ERROR = "system:error",
  SYSTEM_INFO = "system:info",
}

export interface NetworkMessage<T = any> {
  type: MessageType;
  data: T;
  timestamp: number;
  senderId?: string;
  roomId?: string;
  priority?: number;
  reliable?: boolean;
}
