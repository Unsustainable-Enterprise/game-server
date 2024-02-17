import { PartyPool } from '../types/partyTypes';
import sqlite3 from 'sqlite3';
import { dbName } from '../configs/dbConfig';

export namespace PartyPoolManager {
    const partyPool: PartyPool[] = [];

    export function addParty(partyId: string): PartyPool {
        const party = {
            id: partyId,
            db: new sqlite3.Database(dbName),
        };
        partyPool.push(party);

        return party;
    }

    export function removeParty(partyId: string): void {
        const index = partyPool.findIndex((party) => party.id === partyId);

        if (index !== -1) {
            partyPool.splice(index, 1);
        }
    }

    export function findPartyById(partyId: string): PartyPool | undefined {
        return partyPool.find((party) => party.id === partyId);
    }
}
