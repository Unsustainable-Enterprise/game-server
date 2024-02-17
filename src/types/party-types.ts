import { AnswerModel } from '../models/answer-model';
import { ParticipantModel } from '../models/participant-model';
import { PartyModel } from '../models/party-model';

export type PartyDb = {
    id: string;
    pin: string;
    scenario: string;
    host: string;
    total_questions: number;
    win_percentage: number;
};

export type Party = PartyDb & Omit<PartyPool, 'id' | 'pin'>;

export type PartyPool = {
    id: string;
    pin: string;
    partyModel: PartyModel;
    participantModel: ParticipantModel;
    answerModel: AnswerModel;
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

export type IsHost = {
    id: string;
};

export type isPlayerInParty = {
    id: string;
    isHost: boolean;
    isParticipant: boolean;
};
