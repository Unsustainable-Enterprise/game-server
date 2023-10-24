import WebSocket from 'ws';

export type Session = {
    id: string;
    pin: string;
    scenario: string;
    host: WebSocket;
    participants: [{ ws: WebSocket; score: number }];
    totalQuestions: number;
    winPercentage: number;
};

export type Message = {
    event: string;
    token?: string;
    message: { action: { [key: string]: string | number | boolean }; type: string };
};

export enum SessionMessageEvent {
    ALL = 'all',
    HOST = 'host',
    NONE = 'none',
}