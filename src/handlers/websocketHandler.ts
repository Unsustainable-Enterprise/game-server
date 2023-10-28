import { WebSocketEvent, WebSocketMessageEvent } from '../configs/websocketConfig';
import { stringToJSON } from '../utils/stringToJson';
import { LobbyHandler } from '../handlers/lobbyHandler';
import { ExtWebSocket } from '../configs/websocketConfig';

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
                case WebSocketMessageEvent.CREATE_SESSION: {
                    LobbyHandler.createLobby(ws, jsonMessage);
                    break;
                }
                // case WebSocketMessageEvent.MESSAGE_SESSION: {
                //     LobbyHandler.messageSession(ws, jsonMessage);
                //     break;
                // }
                case WebSocketMessageEvent.JOIN_SESSION: {
                    LobbyHandler.joinLobby(ws, jsonMessage);
                    break;
                }
                default: {
                    break;
                }
            }
        });

        ws.on(WebSocketEvent.CLOSE, () => {
            // LobbyHandler.onDissconnet(ws);
            console.log('A user disconnected');
        });
    }
}
