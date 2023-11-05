import * as https from 'https';
import express from 'express';
import cors from 'cors';
import WebSocket from 'ws';
import { WebSocketEvent } from './configs/webSocketConfig';
import { ExtWebSocket } from './types/webSocketTypes';
import fs from 'fs';
import { WebSocketHandler } from './handlers/webSocketHandler';
import { DatabaseModel } from './models/databaseModel';
import { WebSocketManager } from './managers/webSocketManager';

const httpsOptions = {
    key: fs.readFileSync(__dirname + '/security/cert.key'),
    cert: fs.readFileSync(__dirname + '/security/cert.pem'),
};

DatabaseModel.init();

const server = https.createServer(httpsOptions);
const wss = new WebSocket.Server({ server });

wss.on(WebSocketEvent.CONNECTION, (ws: ExtWebSocket, req: any) => {
    WebSocketManager.addWebSocketSession(ws);
    WebSocketHandler.handleWebsocket(ws, req);
});

server.listen(3000, () => {
    console.log('WebSocket server is running on port 3000');
});
