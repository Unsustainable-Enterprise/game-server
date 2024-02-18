import { PartyPoolRecord, Party } from '../types/party-types';
import sqlite3 from 'sqlite3';
import { PartyModel } from '../models/party-model';
import { AnswerModel } from '../models/answer-model';
import { ParticipantModel } from '../models/participant-model';
import { DatabaseModel } from '../models/database-model';

export namespace PartyPoolManager {
    const pool: PartyPoolRecord[] = [];

    export function addParty(partyId: string, pin: string): PartyPoolRecord {
        const db = new sqlite3.Database(DatabaseModel.getDbName());

        const party = {
            id: partyId,
            pin: pin,
            partyModel: new PartyModel(db),
            answerModel: new AnswerModel(db),
            participantModel: new ParticipantModel(db),
        };

        pool.push(party);

        return party;
    }

    export function removeParty(partyId: string): void {
        const index = pool.findIndex((party) => party.id === partyId);

        if (index !== -1) {
            const party = pool[index];
            party.partyModel.removeParty(partyId, party.participantModel, party.answerModel);
            pool.splice(index, 1);
        }
    }

    export async function getPartyById(partyId: string): Promise<Party | null> {
        try {
            const partyPool = pool.find((party) => party.id === partyId);

            if (partyPool) {
                const party = await partyPool.partyModel.getPartyById(partyId);
                return {
                    ...party,
                    partyModel: partyPool.partyModel,
                    participantModel: partyPool.participantModel,
                    answerModel: partyPool.answerModel,
                } as Party;
            }

            return null;
        } catch (error) {
            throw new Error('Error getting party by pin');
        }
    }

    export async function getPartyByPin(pin: string): Promise<Party | null> {
        try {
            const partyPool = pool.find((party) => party.pin === pin);

            if (partyPool) {
                const party = await partyPool.partyModel.getPartyByPin(pin);
                return {
                    ...party,
                    partyModel: partyPool.partyModel,
                    participantModel: partyPool.participantModel,
                    answerModel: partyPool.answerModel,
                } as Party;
            }

            return null;
        } catch (error) {
            throw new Error('Error getting party by pin');
        }
    }
}
