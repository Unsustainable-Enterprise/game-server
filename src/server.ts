import * as https from 'https';
import express, { json } from 'express';
import WebSocket from 'ws';
import { ExtWebSocket, WebSocketEvent, WebSocketMessageEvent } from './configs/websocketConfig';
import fs from 'fs';
import { WebSocketHandler } from './handlers/webSocketHandler';
import { DatabaseModel } from './models/databaseModel';
import { WebSocketManager } from './managers/webSocketManager';

const app = express();
const httpsOptions = {
    key: fs.readFileSync(__dirname + '/security/cert.key'),
    cert: fs.readFileSync(__dirname + '/security/cert.pem'),
};

DatabaseModel.init();

const server = https.createServer(httpsOptions, app);
const wss = new WebSocket.Server({ server });

wss.on(WebSocketEvent.CONNECTION, (ws: ExtWebSocket, req: any) => {
    WebSocketManager.addWebSocketSession(ws);
    WebSocketHandler.handleWebsocket(ws, req);
});

server.listen(3000, () => {
    console.log('WebSocket server is running on https://localhost:3000');
});

// server.close(() => {
//     console.log('Server closed');
// });
