import { WebSocketEvent, WebSocketMessageEvent } from '../configs/webSocketConfig';
import { stringToJSON } from '../utils/stringToJson';
import { LobbyHandler } from './lobbyHandler';
import { ExtWebSocket } from '../configs/webSocketConfig';

export namespace WebSocketHandler {
    export function handleWebsocket(ws: ExtWebSocket, req: any) {
        console.log('A user connected');

        ws.send('Welcome to the server!');

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
