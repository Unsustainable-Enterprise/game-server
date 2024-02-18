import WebSocket from 'ws';

export interface ExtWebSocket extends WebSocket {
    id: string;
}

export enum WebSocketEvent {
    MESSAGE = 'message',
    CLOSE = 'close',
    CONNECTION = 'connection',
}

export enum WebSocketMessageEvent {
    CREATE_PARTY = 'create_party',
    JOIN_PARTY = 'join_party',
    PARTICIPANT_JOINED_PARTY = 'participant_joined_party',
    LEAVE_PARTY = 'leave_party',
    START_GAME = 'start_game',
    ANSWER_QUESTION = 'answer_question',
    DISPLAY_QUESTION_RESULTS = 'display_question_results',
}
