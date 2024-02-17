import { Database } from 'sqlite3';

export type Party = {
    id: string;
    pin: string;
    scenario: string;
    host: string;
    total_questions: number;
    win_percentage: number;
};

export type PartyPool = {
    id: string;
    db: Database;
};

export type Message = {
    event: string;
    token?: string;
    message: { data: { [key: string]: string | number | boolean | number }; type?: string };
};

export type Participants = {
    id: string;
    score: number;
    name: string;
};
