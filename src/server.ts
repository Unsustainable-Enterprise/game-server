import * as https from 'https';
import express, { json } from 'express';
import WebSocket from 'ws';
import { WebSocketEvent, WebSocketMessageEvent } from './config/websocketConfig';
import { sessionHandler } from './handlers/index';
import { stringToJSON } from './utils/stringToJson';
import fs from 'fs';

const app = express();
const httpsOptions = {
    key: fs.readFileSync(__dirname + '/security/cert.key'),
    cert: fs.readFileSync(__dirname + '/security/cert.pem'),
};
const server = https.createServer(httpsOptions, app);
const wss = new WebSocket.Server({ server });

wss.on(WebSocketEvent.CONNECTION, (ws: WebSocket, req) => {
    console.log('A user connected');

    ws.send('Welcome to the server!');

    ws.on(WebSocketEvent.MESSAGE, (message: string) => {
        const jsonMessage = stringToJSON(message);

        if (!jsonMessage) {
            switch (jsonMessage.event) {
                case WebSocketMessageEvent.CREATE_SESSION: {
                    sessionHandler.createSession(ws, jsonMessage);
                    break;
                }
                case WebSocketMessageEvent.MESSAGE_SESSION: {
                    sessionHandler.messageSession(ws, jsonMessage);
                    break;
                }
                default: {
                    break;
                }
            }
        }
    });

    ws.on(WebSocketEvent.CLOSE, () => {
        console.log('A user disconnected');
    });
});

server.listen(3000, () => {
    console.log('WebSocket server is running on https://localhost:3000');
});
