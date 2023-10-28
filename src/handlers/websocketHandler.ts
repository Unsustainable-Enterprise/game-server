import WebSocket from 'ws';
import { WebSocketEvent, WebSocketMessageEvent } from '../config/websocketConfig';
import { stringToJSON } from '../utils/stringToJson';
import { sessionHandler } from './index';

class WebSocketHandler {
    public handleWebsocket(ws: WebSocket, req: any) {
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
                    sessionHandler.createSession(ws, jsonMessage);
                    break;
                }
                case WebSocketMessageEvent.MESSAGE_SESSION: {
                    sessionHandler.messageSession(ws, jsonMessage);
                    break;
                }
                case WebSocketMessageEvent.JOIN_SESSION: {
                    sessionHandler.joinSession(ws, jsonMessage);
                    break;
                }
                default: {
                    break;
                }
            }
        });

        ws.on(WebSocketEvent.CLOSE, () => {
            sessionHandler.onDissconnet(ws);
            console.log('A user disconnected');
        });
    }
}

export default new WebSocketHandler();
