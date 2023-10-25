import WebSocket from 'ws';

export function sendMessage(ws: WebSocket, token: string, data: object) {
    const message = {
        token,
        message: {
            data,
        },
    };

    ws.send(JSON.stringify(message));
}
