export var MessageType;
(function (MessageType) {
    MessageType["ENTITY_CREATE"] = "entity:create";
    MessageType["ENTITY_UPDATE"] = "entity:update";
    MessageType["ENTITY_DELETE"] = "entity:delete";
    MessageType["PLAYER_JOIN"] = "player:join";
    MessageType["PLAYER_LEAVE"] = "player:leave";
    MessageType["CHAT_MESSAGE"] = "chat:message";
})(MessageType || (MessageType = {}));
