import * as http from 'http';
import express from 'express';
import WebSocket from 'ws';
import router from './routes';
import { WebSocketEvent } from './types/websocket';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
app.use(router);

wss.on(WebSocketEvent.CONNECTION, (ws: WebSocket, req) => {
    console.log('A user connected');

    ws.send('Welcome to the server!');

    ws.on(WebSocketEvent.MESSAGE, (message: string) => {
        console.log(`Received: ${message}`);
    });

    ws.on(WebSocketEvent.CLOSE, () => {
        console.log('A user disconnected');
    });
});

server.listen(3000, () => {
    console.log('WebSocket server is running on http://localhost:3000');
});
