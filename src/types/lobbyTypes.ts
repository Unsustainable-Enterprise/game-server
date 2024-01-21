export type Lobby = {
    id: string;
    pin: string;
    scenario: string;
    host: string;
    participants: Participants[];
    total_questions: number;
    win_percentage: number;
};

export type Message = {
    event: string;
    token?: string;
    message: { data: { [key: string]: string | number | boolean }; type?: string };
};

export type Participants = {
    id: string;
    score: number;
    name: string;
};
