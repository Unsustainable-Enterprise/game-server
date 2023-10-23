import WebSocket from 'ws';

export type Session = {
    id: string;
    pin: string;
    scenario: string;
    host: WebSocket;
    participants: WebSocket[];
};

export type Message = {
    event: string;
    token?: string;
    message: object;
};
