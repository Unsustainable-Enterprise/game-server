import WebSocket from 'ws';

export function sendMessage(ws: WebSocket, event: string, token: string, data: object) {
    const message = {
        event,
        token,
        message: {
            ...data,
        },
    };

    ws.send(JSON.stringify(message));
}
