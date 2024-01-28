export enum WebSocketEvent {
    MESSAGE = 'message',
    CLOSE = 'close',
    CONNECTION = 'connection',
}

export enum WebSocketMessageEvent {
    CREATE_LOBBY = 'create_lobby',
    MESSAGE_LOBBY = 'message_lobby',
    JOIN_LOBBY = 'join_lobby',
    PARTICIPANT_JOINED_LOBBY = 'participant_joined_lobby',
    LEAVE_LOBBY = 'leave_lobby',
    START_GAME = 'start_game',
    ANSWER_QUESTION = 'answer_question',
}
