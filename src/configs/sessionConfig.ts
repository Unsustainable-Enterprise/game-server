import WebSocket from 'ws';

export enum SessionMessageEvent {
    ALL = 'all',
    HOST = 'host',
    NONE = 'none',
}

export type Session = {
    id: string;
    pin: string;
    scenario: string;
    host: WebSocket;
    participants: [{ ws: WebSocket; name: string; score: number }];
    totalQuestions: number;
    winPercentage: number;
};

export type Message = {
    event: string;
    token?: string;
    message: { data: { [key: string]: string | number | boolean }; type?: string };
};

export type Participants = {
    ws: WebSocket;
    score: number;
};
