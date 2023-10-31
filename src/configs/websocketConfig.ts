import WebSocket from 'ws';
export interface ExtWebSocket extends WebSocket {
    id: string;
}

export enum WebSocketEvent {
    MESSAGE = 'message',
    CLOSE = 'close',
    CONNECTION = 'connection',
}

export enum WebSocketMessageEvent {
    CREATE_LOBBY = 'create_lobby',
    MESSAGE_LOBBY = 'message_lobby',
    JOIN_LOBBY = 'join_lobby',
}
