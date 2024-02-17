import { json } from 'express';
import { WebSocketEvent, WebSocketMessageEvent } from '../types/webSocketTypes';
import { ExtWebSocket } from '../types/webSocketTypes';
import { stringToJSON } from '../utils/stringToJson';
import { GameHandler } from './gameHandler';
import { PartyHandler } from './partyHandler';

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
                case WebSocketMessageEvent.CREATE_PARTY: {
                    PartyHandler.createParty(ws, jsonMessage);
                    break;
                }
                case WebSocketMessageEvent.JOIN_PARTY: {
                    PartyHandler.joinParty(ws, jsonMessage);
                    break;
                }
                // case WebSocketMessageEvent.LEAVE_PARTY: {
                //     PartyHandler.onDisconnect(ws);
                //     break;
                // }
                case WebSocketMessageEvent.START_GAME: {
                    GameHandler.startGame(ws, jsonMessage);
                    break;
                }
                // case WebSocketMessageEvent.ANSWER_QUESTION: {
                //     LobbyHandler.answerQuestion(ws, jsonMessage);
                //     break;
                // }
                // case WebSocketMessageEvent.DISPLAY_QUESTION_RESULTS: {
                //     LobbyHandler.displayQuestionResults(ws, jsonMessage);
                //     break;
                // }
                default: {
                    break;
                }
            }
        });

        // ws.on(WebSocketEvent.CLOSE, () => {
        //     PartyHandler.onDisconnect(ws);
        //     console.log('A user disconnected');
        // });
    }
}
