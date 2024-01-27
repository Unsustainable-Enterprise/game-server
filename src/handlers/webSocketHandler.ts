import { WebSocketEvent, WebSocketMessageEvent } from '../configs/webSocketConfig';
import { ExtWebSocket } from '../types/webSocketTypes';
import { stringToJSON } from '../utils/stringToJson';
import { LobbyHandler } from './lobbyHandler';

export namespace WebSocketHandler {
    export function handleWebsocket(ws: ExtWebSocket, req: any) {
        console.log('A user connected');

        ws.on(WebSocketEvent.MESSAGE, (message: string) => {
            const jsonMessage = stringToJSON(message);

            if (!jsonMessage) {
                console.log('Failed to parse JSON from the received message');
                return;
            }

            switch (jsonMessage.event) {
                case WebSocketMessageEvent.CREATE_LOBBY: {
                    LobbyHandler.createLobby(ws, jsonMessage);
                    break;
                }
                case WebSocketMessageEvent.MESSAGE_LOBBY: {
                    LobbyHandler.messageLobby(ws, jsonMessage);
                    break;
                }
                case WebSocketMessageEvent.JOIN_LOBBY: {
                    LobbyHandler.joinLobby(ws, jsonMessage);
                    break;
                }
                case WebSocketMessageEvent.LEAVE_LOBBY: {
                    LobbyHandler.onDisconnect(ws);
                    break;
                }
                case WebSocketMessageEvent.START_GAME: {
                    LobbyHandler.startGame(ws);
                    break;
                }
                default: {
                    break;
                }
            }
        });

        ws.on(WebSocketEvent.CLOSE, () => {
            LobbyHandler.onDisconnect(ws);
            console.log('A user disconnected');
        });
    }
}
