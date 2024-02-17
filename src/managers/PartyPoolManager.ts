import { PartyPool } from '../types/partyTypes';
import sqlite3 from 'sqlite3';
import { dbName } from '../configs/dbConfig';
import { PartyModel } from '../models/partyModel';
import { AnswerModel } from '../models/answerModel';
import { ParticipantModel } from '../models/participantModel';

export namespace PartyPoolManager {
    const partyPool: PartyPool[] = [];

    export function addParty(partyId: string): PartyPool {
        const db = new sqlite3.Database(dbName);

        const party = {
            id: partyId,
            partyModel: new PartyModel(db),
            answerModel: new AnswerModel(db),
            participantModel: new ParticipantModel(db),
        };

        partyPool.push(party);

        return party;
    }

    export function removeParty(partyId: string): void {
        const index = partyPool.findIndex((party) => party.id === partyId);

        if (index !== -1) {
            const party = partyPool[index];
            party.partyModel.removeParty(partyId, party.participantModel, party.answerModel);
            partyPool.splice(index, 1);
        }
    }

    export function findPartyById(partyId: string): PartyPool | undefined {
        return partyPool.find((party) => party.id === partyId);
    }
}
