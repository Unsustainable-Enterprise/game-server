import * as https from 'https';
import WebSocket from 'ws';
import { WebSocketEvent } from './types/websocket-types';
import { ExtWebSocket } from './types/websocket-types';
import fs from 'fs';
import { WebSocketHandler } from './handlers/websocket-handler';
import { DatabaseModel } from './models/database-model';
import { WebSocketManager } from './managers/websocket-manager';

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
