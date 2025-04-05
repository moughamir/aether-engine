export enum MessageType {
  ENTITY_CREATE = 'entity:create',
  ENTITY_UPDATE = 'entity:update',
  ENTITY_DELETE = 'entity:delete',
  PLAYER_JOIN = 'player:join',
  PLAYER_LEAVE = 'player:leave',
  CHAT_MESSAGE = 'chat:message'
}

export interface NetworkMessage<T = any> {
  type: MessageType;
  data: T;
  timestamp: number;
  senderId?: string;
}