import * as https from 'https';
import express, { json } from 'express';
import WebSocket from 'ws';
import { WebSocketEvent, WebSocketMessageEvent } from './configs/websocketConfig';
import fs from 'fs';
import { webSocketHandler } from './handlers/index';

const app = express();
const httpsOptions = {
    key: fs.readFileSync(__dirname + '/security/cert.key'),
    cert: fs.readFileSync(__dirname + '/security/cert.pem'),
};
const server = https.createServer(httpsOptions, app);
const wss = new WebSocket.Server({ server });

wss.on(WebSocketEvent.CONNECTION, (ws: WebSocket, req) => {
    webSocketHandler.handleWebsocket(ws, req);
});

server.listen(3000, () => {
    console.log('WebSocket server is running on https://localhost:3000');
});
