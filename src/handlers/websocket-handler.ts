import { json } from 'express';
import { WebSocketEvent, WebSocketMessageEvent } from '../types/websocket-types';
import { ExtWebSocket } from '../types/websocket-types';
import { stringToJSON } from '../utils/string-to-json';
import { GameHandler } from './game-handler';
import { PartyHandler } from './party-handler';
import { AnswerHandler } from './answer-handler';

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
                case WebSocketMessageEvent.LEAVE_PARTY: {
                    PartyHandler.onDisconnect(ws);
                    break;
                }
                case WebSocketMessageEvent.START_GAME: {
                    GameHandler.startGame(ws, jsonMessage);
                    break;
                }
                case WebSocketMessageEvent.ANSWER_QUESTION: {
                    AnswerHandler.answerQuestion(ws, jsonMessage);
                    break;
                }
                case WebSocketMessageEvent.DISPLAY_QUESTION_RESULTS: {
                    AnswerHandler.displayQuestionResults(ws, jsonMessage);
                    break;
                }
                default: {
                    break;
                }
            }
        });

        ws.on(WebSocketEvent.CLOSE, () => {
            PartyHandler.onDisconnect(ws);
            console.log('A user disconnected');
        });
    }
}
