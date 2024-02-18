import { ExtWebSocket } from '../types/websocket-types';
import { v4 as uuidv4 } from 'uuid';

export namespace WebSocketManager {
    const webSocketSessions = new Map();

    export function addWebSocketSession(ws: ExtWebSocket) {
        const id = uuidv4();

        ws.id = id;
        webSocketSessions.set(id, ws);
    }

    export function removeWebSocketSession(id: number) {
        webSocketSessions.delete(id);
    }

    export function getWebSocketSession(id: string) {
        return webSocketSessions.get(id);
    }
}
