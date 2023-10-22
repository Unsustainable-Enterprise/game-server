import * as https from 'https';
import express from 'express';
import WebSocket from 'ws';
import { WebSocketEvent } from './types/websocket';
import { sessionHandler } from './handlers/index';
import { decrypt } from './utils/decrypt';
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
        if (decrypt(message).event === 'create') {
            sessionHandler.initiateSession(ws);
        }
        console.log(`Received: ${message}`);
    });

    ws.on(WebSocketEvent.CLOSE, () => {
        console.log('A user disconnected');
    });
});

server.listen(3000, () => {
    console.log('WebSocket server is running on https://localhost:3000');
});
