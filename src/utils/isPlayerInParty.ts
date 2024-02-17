import { PartyModel } from '../models/partyModel';
import { ParticipantModel } from '../models/participantModel';
import sqlite3 from 'sqlite3';
import { isPlayerInParty } from '../types/partyTypes';
import { DatabaseModel } from '../models/databaseModel';

export async function isPlayerInParty(wsId: string): Promise<isPlayerInParty> {
    const db = new sqlite3.Database(DatabaseModel.getDbName());
    try {
        const partyModel = new PartyModel(db);
        const participantModel = new ParticipantModel(db);

        let partyId = await partyModel.getPartyIdByHost(wsId);
        if (partyId) {
            return { id: partyId, isHost: true, isParticipant: false };
        }

        partyId = await participantModel.getParticipantPartyId(wsId);
        if (partyId) {
            return { id: partyId, isHost: false, isParticipant: true };
        }

        return { id: '', isHost: false, isParticipant: false };
    } catch (error) {
        throw new Error('Error checking for host or participant');
    } finally {
        db.close();
    }
}
