export enum WebSocketEvent {
    MESSAGE = 'message',
    CLOSE = 'close',
    CONNECTION = 'connection',
}

export enum WebSocketMessageEvent {
    CREATE_SESSION = 'create_session',
    MESSAGE_SESSION = 'message_session',
    JOIN_SESSION = 'join_session',
}
